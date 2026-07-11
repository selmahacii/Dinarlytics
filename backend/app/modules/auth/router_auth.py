"""
Authentication API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone
import logging

from app.core.database import get_db
from app.core.models import User, Company, UserRole, Role, UserSession
from app.core.security import (
    PasswordManager,
    JWTManager,
    TokenData,
    AccessToken,
    RefreshTokenRequest,
    SessionManager,
    RBACManager
)
from app.core.limiter import limiter
from app.modules.system.utils_audit import log_audit
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

class CompanyInfo(BaseModel):
    id: str
    name: str
    registration_number: Optional[str] = None
    tax_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    currency_code: Optional[str] = None
    country: Optional[str] = None
    parent_company_id: Optional[str] = None
    max_users: Optional[int] = None
    is_active: bool = True

class UserInfo(BaseModel):
    user_id: str
    username: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    company_id: str
    company_name: Optional[str] = None
    roles: list
    permissions: list

class UpdateCompanyRequest(BaseModel):
    name: Optional[str] = None
    registration_number: Optional[str] = None
    tax_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    currency_code: Optional[str] = None
    country: Optional[str] = None
    is_active: Optional[bool] = None

class CreateSubsidiaryRequest(BaseModel):
    name: str
    registration_number: Optional[str] = None
    tax_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    currency_code: Optional[str] = "DZD"
    country: Optional[str] = "Algérie"
    ownership_percentage: Optional[float] = 100

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

def require_permission(
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
@limiter.limit("5/minute")
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user and return JWT tokens"""
    
    # Get IP and user-agent
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("User-Agent", "unknown")
    
    # Check login attempts
    if not SessionManager.record_login_attempt(login_data.username, success=False):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Find user
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if not user or not PasswordManager.verify_password(login_data.password, user.password_hash):
        logger.warning(f"Failed login attempt for user: {login_data.username}")
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
            "roles": roles,
            "company_id": str(user.company_id)
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
    
    company = db.query(Company).filter(Company.id == user.company_id).first()

    return UserInfo(
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        company_id=str(user.company_id),
        company_name=company.name if company else None,
        roles=current_user.roles,
        permissions=current_user.permissions
    )


@router.get("/company", response_model=CompanyInfo)
async def get_current_company(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's company details."""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return CompanyInfo(
        id=str(company.id), name=company.name,
        registration_number=company.registration_number, tax_number=company.tax_number,
        address=company.address, phone=company.phone, email=company.email,
        website=company.website, currency_code=company.currency_code, country=company.country,
        parent_company_id=str(company.parent_company_id) if company.parent_company_id else None,
        max_users=company.max_users,
        is_active=company.is_active
    )


@router.put("/companies/{company_id}", response_model=CompanyInfo)
async def update_company(
    company_id: str,
    request: UpdateCompanyRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a company's details — the caller's own company or one of its
    subsidiaries (requires manage_users permission)."""
    if not RBACManager.check_permission(current_user.roles, "manage_users"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Company management access required")

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if str(company.id) != current_user.company_id and str(company.parent_company_id) != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this company")

    for field, value in request.dict(exclude_unset=True).items():
        setattr(company, field, value)
    log_audit(db, current_user, 'UPDATE', 'COMPANY', str(company.id), request.dict(exclude_unset=True))
    db.commit()
    db.refresh(company)

    return CompanyInfo(
        id=str(company.id), name=company.name,
        registration_number=company.registration_number, tax_number=company.tax_number,
        address=company.address, phone=company.phone, email=company.email,
        website=company.website, currency_code=company.currency_code, country=company.country,
        parent_company_id=str(company.parent_company_id) if company.parent_company_id else None,
        max_users=company.max_users,
        is_active=company.is_active
    )


@router.get("/companies", response_model=List[CompanyInfo])
async def list_group_companies(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List the current company and any subsidiaries linked via parent_company_id."""
    own = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not own:
        raise HTTPException(status_code=404, detail="Company not found")
    subsidiaries = db.query(Company).filter(Company.parent_company_id == own.id).all()
    companies = [own] + subsidiaries
    return [
        CompanyInfo(
            id=str(c.id), name=c.name,
            registration_number=c.registration_number, tax_number=c.tax_number,
            address=c.address, phone=c.phone, email=c.email,
            website=c.website, currency_code=c.currency_code, country=c.country,
            parent_company_id=str(c.parent_company_id) if c.parent_company_id else None,
            max_users=c.max_users,
            is_active=c.is_active
        ) for c in companies
    ]


@router.post("/companies", response_model=CompanyInfo, status_code=status.HTTP_201_CREATED)
async def create_subsidiary_company(
    request: CreateSubsidiaryRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a subsidiary company linked to the current company (for group consolidation)."""
    if not RBACManager.check_permission(current_user.roles, "manage_users"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Company management access required")

    existing = db.query(Company).filter(Company.name == request.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A company with this name already exists")

    subsidiary = Company(
        name=request.name,
        registration_number=request.registration_number,
        tax_number=request.tax_number,
        address=request.address,
        phone=request.phone,
        email=request.email,
        website=request.website,
        currency_code=request.currency_code,
        country=request.country,
        parent_company_id=current_user.company_id,
        ownership_percentage=request.ownership_percentage,
        is_active=True
    )
    db.add(subsidiary)
    db.flush()
    log_audit(db, current_user, 'CREATE', 'COMPANY', str(subsidiary.id), {'name': subsidiary.name})
    db.commit()
    db.refresh(subsidiary)

    return CompanyInfo(
        id=str(subsidiary.id), name=subsidiary.name,
        registration_number=subsidiary.registration_number, tax_number=subsidiary.tax_number,
        address=subsidiary.address, phone=subsidiary.phone, email=subsidiary.email,
        website=subsidiary.website, currency_code=subsidiary.currency_code, country=subsidiary.country,
        parent_company_id=str(subsidiary.parent_company_id),
        max_users=subsidiary.max_users,
        is_active=subsidiary.is_active
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
    
@router.get("/demo-users", response_model=dict)
async def get_demo_users():
    """Get optimized demo users for UI demonstration (non-production only)"""
    from app.core.config import settings
    if settings.APP_ENVIRONMENT == "production":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    demo_users = [
        # EURL - Petite Entreprise (Micro)
        {
            "id": "demo-eurl-gerant",
            "email": "karim.b@electromenager-plus.dz",
            "password": "demo123",
            "companyName": "Électroménager Plus (EURL)",
            "companyType": "eurl",
            "segment": "micro",
            "prenom": "Karim",
            "nom": "Benali",
            "role": "gerant",
            "role_display": "Gérant Propriétaire",
            "description": "Accès complet, gestion simplifiée trésorerie & ventes",
            "permissions": ["all"],
             "avatar_color": "bg-blue-100 text-blue-800"
        },
        
        # SARL - Moyenne Entreprise (Small/Medium)
        {
            "id": "demo-sarl-gerant",
            "email": "samia.m@mode-moderne.dz",
            "password": "demo123",
            "companyName": "Mode Moderne SARL",
            "companyType": "sarl",
            "segment": "small",
            "prenom": "Samia",
            "nom": "Meziane",
            "role": "gerant",
             "role_display": "Gérante Associée",
            "description": "Vue d'ensemble, validation dépenses, rapports financiers",
            "permissions": ["all"],
             "avatar_color": "bg-purple-100 text-purple-800"
        },
        {
            "id": "demo-sarl-comptable",
            "email": "ahmed.k@mode-moderne.dz",
            "password": "demo123",
            "companyName": "Mode Moderne SARL",
            "companyType": "sarl",
             "segment": "small",
            "prenom": "Ahmed",
            "nom": "Khaled",
            "role": "comptable",
             "role_display": "Comptable Principal",
            "description": "Saisie écritures, états financiers, déclarations",
            "permissions": ["accounting", "reports"],
             "avatar_color": "bg-indigo-100 text-indigo-800"
        },
        {
            "id": "demo-sarl-commercial",
            "email": "lylia.z@mode-moderne.dz",
            "password": "demo123",
            "companyName": "Mode Moderne SARL",
             "companyType": "sarl",
             "segment": "small",
            "prenom": "Lylia",
            "nom": "Ziani",
            "role": "commercial",
             "role_display": "Responsable Ventes",
            "description": "Gestion clients, devis, facturation, catalogue",
            "permissions": ["sales", "crm"],
             "avatar_color": "bg-pink-100 text-pink-800"
        },

        # SPA - Grande Entreprise (Corporate & Industrial)
        {
            "id": "demo-spa-dg",
            "email": "mourad.ouali@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
             "companyType": "spa",
             "segment": "enterprise",
            "prenom": "Mourad",
            "nom": "Ouali",
            "role": "dg",
             "role_display": "Directeur Général (CEO)",
            "description": "Vue 360°, validation stratégique, budgets globaux, KPIs groupe.",
            "permissions": ["all", "approve_strategic"],
             "avatar_color": "bg-slate-900 text-white border-slate-700"
        },
         {
            "id": "demo-spa-daf",
            "email": "safia.haddad@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
             "companyType": "spa",
             "segment": "enterprise",
            "prenom": "Safia",
            "nom": "Haddad",
            "role": "daf",
             "role_display": "Directrice Admin & Financière (CFO)",
            "description": "Contrôle financier, trésorerie complexe, consolidation, fiscalité, relation banques.",
             "permissions": ["finance_full", "approve_budget", "treasury_manage"],
             "avatar_color": "bg-emerald-100 text-emerald-800 border-emerald-300"
        },
        {
            "id": "demo-spa-dir-co",
            "email": "amine.ziani@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Amine",
            "nom": "Ziani",
            "role": "commercial_director",
            "role_display": "Directeur Commercial",
            "description": "Stratégie vente, objectifs équipes, validation gros contrats, analyse revenus.",
            "permissions": ["sales_manage", "crm_full", "reports_sales"],
            "avatar_color": "bg-blue-600 text-white border-blue-500"
        },
        {
            "id": "demo-spa-rh",
            "email": "leila.b@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Leila",
            "nom": "Bouzidi",
            "role": "hr_director",
            "role_display": "Directrice RH",
            "description": "Gestion paie masse, contrats, recrutement, performance, conformité sociale.",
            "permissions": ["hr_full", "payroll_manage"],
            "avatar_color": "bg-pink-100 text-pink-800 border-pink-300"
        },
        {
            "id": "demo-spa-logistique",
            "email": "omar.k@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Omar",
            "nom": "Khodja",
            "role": "logistics_director",
            "role_display": "Directeur Logistique / Supply Chain",
            "description": "Gestion stocks multi-dépôts, approvisionnements, livraisons flotte.",
            "permissions": ["stock_full", "logistics_manage"],
            "avatar_color": "bg-orange-100 text-orange-800 border-orange-300"
        },
        {
            "id": "demo-spa-prod",
            "email": "rachid.t@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Rachid",
            "nom": "Toumi",
            "role": "production_director",
            "role_display": "Directeur Production",
            "description": "Planification production, coûts industriels, maintenance, qualité.",
            "permissions": ["production_manage", "costing_view"],
            "avatar_color": "bg-zinc-100 text-zinc-800 border-zinc-300"
        },
        {
            "id": "demo-spa-comptable-senior",
            "email": "nawel.s@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
             "companyType": "spa",
             "segment": "enterprise",
            "prenom": "Nawel",
            "nom": "Saadi",
            "role": "comptable_senior",
             "role_display": "Chef Comptable",
            "description": "Supervision comptable, clôtures mensuelles, déclarations fiscales.",
             "permissions": ["accounting_full", "reports_financial"],
             "avatar_color": "bg-indigo-100 text-indigo-800 border-indigo-300"
        },
        {
            "id": "demo-spa-controleur",
            "email": "fared.m@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Fared",
            "nom": "Mansouri",
            "role": "controleur_gestion",
            "role_display": "Contrôleur de Gestion",
            "description": "Analyse écarts budgets, comptabilité analytique, reporting performance.",
            "permissions": ["analytics_full", "budget_view", "accounting_read"],
            "avatar_color": "bg-cyan-100 text-cyan-800 border-cyan-300"
        },
        {
            "id": "demo-spa-auditeur",
            "email": "cabinet.expert@audit-externe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
             "companyType": "spa",
             "segment": "enterprise",
            "prenom": "Cabinet",
            "nom": "Expert Audit",
            "role": "auditeur",
             "role_display": "Auditeur Externe (CAC)",
            "description": "Accès lecture seule audit, vérification états financiers, conformité légale.",
             "permissions": ["audit_read", "read_only"],
             "avatar_color": "bg-amber-100 text-amber-800 border-amber-300"
        },
        {
            "id": "demo-spa-vendeur",
            "email": "karim.v@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Karim",
            "nom": "Vendeur",
            "role": "commercial",
            "role_display": "Commercial Terrain",
            "description": "Saisie commandes, suivi portefeuille clients, consultation stock.",
            "permissions": ["orders_create", "clients_view", "stock_read"],
            "avatar_color": "bg-pink-50 text-pink-700 border-pink-200"
        },
        {
            "id": "demo-spa-magasinier",
            "email": "ali.stock@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Ali",
            "nom": "Stock",
            "role": "magasinier",
            "role_display": "Responsable Entrepôt",
            "description": "Réception marchandises, expéditions, inventaire physique.",
            "permissions": ["stock_move", "delivery_manage"],
            "avatar_color": "bg-yellow-100 text-yellow-800 border-yellow-300"
        },
         {
            "id": "demo-spa-tresorier",
            "email": "samir.cash@industrie-groupe.dz",
            "password": "demo123",
            "companyName": "Industrie Groupe SPA",
            "companyType": "spa",
            "segment": "enterprise",
            "prenom": "Samir",
            "nom": "Cash",
            "role": "tresorier",
            "role_display": "Trésorier",
            "description": "Gestion liquidités quotidienne, rapprochements bancaires, paiements fournisseurs.",
            "permissions": ["treasury_ops", "payments_manage"],
            "avatar_color": "bg-green-100 text-green-800 border-green-300"
        }
    ]
    
    return {
        "users": [], # For now not returning user objects directly to avoid confusing frontend types
        "credentials": demo_users
    }
