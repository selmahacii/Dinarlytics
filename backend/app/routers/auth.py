"""
Authentication API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone
import logging

from app.database import get_db
from app.models.models import User, Company, UserRole, Role, UserSession
from app.security import (
    PasswordManager,
    JWTManager,
    TokenData,
    AccessToken,
    RefreshTokenRequest,
    SessionManager,
    RBACManager
)
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

# ========== REQUEST/RESPONSE MODELS ==========
class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(...)
    last_name: str = Field(...)
    company_name: Optional[str] = None
    company_id: Optional[str] = None

class RegisterResponse(BaseModel):
    user_id: str
    username: str
    email: str
    message: str

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(...)

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict
    expires_in: int

class UserInfo(BaseModel):
    user_id: str
    username: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    company_id: str
    roles: list
    permissions: list

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

# ========== DEPENDENCIES ==========
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> TokenData:
    """
    Dependency to verify JWT token and get current user
    Expects: Authorization: Bearer <token>
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise credentials_exception
    
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            raise credentials_exception
    except ValueError:
        raise credentials_exception
    
    # Verify token
    token_data = JWTManager.verify_token(token, token_type="access")
    if not token_data:
        raise credentials_exception
    
    return token_data

async def require_permission(
    required_permission: str
) -> callable:
    """Factory for permission requirement dependency"""
    async def _require_permission(current_user: TokenData = Depends(get_current_user)):
        if not RBACManager.check_permission(current_user.roles, required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{required_permission}' required"
            )
        return current_user
    return _require_permission

# ========== ENDPOINTS ==========
@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    
    # Validate password strength
    is_valid, error_msg = PasswordManager.validate_password_strength(request.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == request.username) | (User.email == request.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered"
        )
    
    # Get or create company
    company_id = request.company_id
    if not company_id:
        # Create new company
        company = Company(
            name=request.company_name or f"{request.first_name}'s Company"
        )
        db.add(company)
        db.flush()
        company_id = str(company.id)
    
    # Create new user
    hashed_password = PasswordManager.hash_password(request.password)
    new_user = User(
        company_id=company_id,
        username=request.username,
        email=request.email,
        password_hash=hashed_password,
        first_name=request.first_name,
        last_name=request.last_name,
        is_verified=True  # In production, send verification email
    )
    
    db.add(new_user)
    db.flush()
    
    # Assign default role (employee)
    default_role = db.query(Role).filter(Role.name == "employee").first()
    if default_role:
        user_role = UserRole(user_id=new_user.id, role_id=default_role.id)
        db.add(user_role)
    
    db.commit()
    
    logger.info(f"New user registered: {request.username}")
    
    return RegisterResponse(
        user_id=str(new_user.id),
        username=new_user.username,
        email=new_user.email,
        message="User registered successfully"
    )

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Login user and return JWT tokens"""
    
    # Get IP and user-agent
    ip_address = req.client.host if req.client else "unknown"
    user_agent = req.headers.get("User-Agent", "unknown")
    
    # Check login attempts
    if not SessionManager.record_login_attempt(request.username, success=False):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Find user
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user or not PasswordManager.verify_password(request.password, user.password_hash):
        logger.warning(f"Failed login attempt for user: {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Get user roles and permissions
    roles = [role.name for role in user.roles]
    permissions = RBACManager.get_user_permissions(roles, user.permissions)

    
    # Create tokens
    access_token = JWTManager.create_access_token(
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        company_id=str(user.company_id),
        roles=roles,
        permissions=permissions
    )
    
    refresh_token = JWTManager.create_refresh_token(
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        company_id=str(user.company_id)
    )
    
    # Create session
    session_expires = datetime.now(timezone.utc)
    session_id = SessionManager.create_session(str(user.id), str(user.company_id), ip_address, user_agent)
    
    # Save session to database
    db_session = UserSession(
        user_id=user.id,
        access_token=access_token,
        refresh_token=refresh_token,
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=session_expires,
        is_active=True
    )
    db.add(db_session)
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    # Record successful login
    SessionManager.record_login_attempt(request.username, success=True)
    
    logger.info(f"Successful login for user: {request.username}")
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "user_id": str(user.id),
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "roles": roles
        },
        expires_in=1800  # 30 minutes
    )

@router.post("/refresh", response_model=AccessToken)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    
    # Verify refresh token
    token_data = JWTManager.verify_token(request.refresh_token, token_type="refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Get updated roles and permissions
    roles = [role.name for role in user.roles]
    permissions = RBACManager.get_user_permissions(roles)
    
    # Create new access token
    new_access_token = JWTManager.create_access_token(
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        company_id=str(user.company_id),
        roles=roles,
        permissions=permissions
    )
    
    logger.info(f"Access token refreshed for user: {user.username}")
    
    return AccessToken(
        access_token=new_access_token,
        refresh_token=request.refresh_token,
        token_type="bearer",
        expires_in=1800
    )

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserInfo(
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        company_id=str(user.company_id),
        roles=current_user.roles,
        permissions=current_user.permissions
    )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout user and invalidate session"""
    
    # Invalidate session in database
    db.query(UserSession).filter(
        UserSession.user_id == current_user.user_id
    ).update({"is_active": False})
    db.commit()
    
    logger.info(f"User logged out: {current_user.username}")
    
    return {"message": "Logged out successfully"}

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Validate password strength
    is_valid, error_msg = PasswordManager.validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Get user and verify current password
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user or not PasswordManager.verify_password(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    user.password_hash = PasswordManager.hash_password(request.new_password)
    db.commit()
    
    logger.info(f"Password changed for user: {user.username}")
    
    return {"message": "Password changed successfully"}
