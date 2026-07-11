from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.models import User, Role, UserRole
from app.modules.auth.router_auth import require_permission, get_current_user
from app.core.security import PasswordManager, TokenData
from app.modules.system.utils_audit import log_audit
from pydantic import BaseModel, EmailStr, Field
import uuid

router = APIRouter(prefix="/users", tags=["users"])

# --- Models ---
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role_name: str  # "admin", "manager", etc.
    permissions: Optional[List[str]] = None # Detailed override

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_name: Optional[str] = None
    permissions: Optional[List[str]] = None


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    role: str
    permissions: List[str]
    is_active: bool


# --- Endpoints ---

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user_as_admin(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(require_permission("manage_users"))
):
    """
    Super Admin can create users and assign specific roles immediately.
    """
    # 0. Plafond utilisateurs du plan appliqué côté serveur (NULL = illimité)
    from app.core.models import Company
    from sqlalchemy import func
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if company and company.max_users is not None:
        current_count = db.query(func.count(User.id)).filter(
            User.company_id == current_user.company_id,
            User.is_active == True
        ).scalar() or 0
        if current_count >= company.max_users:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Plafond d'utilisateurs du plan atteint ({company.max_users}). Mettez à niveau le plan pour ajouter des utilisateurs."
            )

    # 1. Check uniqueness
    if db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already exists")

    # 2. Get proper role
    role_db = db.query(Role).filter(Role.name == user_in.role_name).first()
    if not role_db:
        # Auto-create role if consistent with config? Better to enforce strict roles.
        # Check standard lists
        from app.core.config import ROLES
        if user_in.role_name in ROLES:
             role_db = Role(name=user_in.role_name, permissions=ROLES[user_in.role_name]["permissions"])
             db.add(role_db)
             db.flush()
        else:
             raise HTTPException(status_code=400, detail=f"Invalid role: {user_in.role_name}")

    # 3. Create User
    new_user = User(
        company_id=current_user.company_id, # Assign to current admin's company
        username=user_in.username,
        email=user_in.email,
        password_hash=PasswordManager.hash_password(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        is_verified=True,
        is_active=True,
        permissions=user_in.permissions or []
    )
    db.add(new_user)

    db.flush()

    # 4. Assign Role
    user_role = UserRole(user_id=new_user.id, role_id=role_db.id)
    db.add(user_role)

    log_audit(db, current_user, "CREATE", "USER", str(new_user.id), {"username": new_user.username, "role": role_db.name})
    db.commit()
    db.refresh(new_user)

    return UserOut(
        id=str(new_user.id),
        username=new_user.username,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=role_db.name,
        permissions=new_user.permissions or [],
        is_active=new_user.is_active
    )


@router.get("/", response_model=List[UserOut])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(require_permission("manage_users"))
):
    """List all users in the company with their roles."""
    users = db.query(User).filter(
        User.company_id == current_user.company_id
    ).order_by(User.username).offset(skip).limit(limit).all()
    results = []
    for u in users:
        # Assuming single role for simplicity as per Register logic
        role_name = "employee"
        if u.roles:
            role_name = u.roles[0].name
        
        results.append(UserOut(
            id=str(u.id),
            username=u.username,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            role=role_name,
            permissions=u.permissions or [],
            is_active=u.is_active
        ))

    return results

@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(require_permission("manage_users"))
):
    user = db.query(User).filter(User.id == user_id, User.company_id == current_user.company_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.role_name:
        role_db = db.query(Role).filter(Role.name == user_in.role_name).first()
        if not role_db:
             raise HTTPException(status_code=400, detail=f"Invalid role")
        
        # Clear old roles
        db.query(UserRole).filter(UserRole.user_id == user.id).delete()
        # Add new
        db.add(UserRole(user_id=user.id, role_id=role_db.id))

    # Update basic fields
    for field, value in user_in.dict(exclude={"role_name", "permissions"}, exclude_unset=True).items():
        setattr(user, field, value)
    
    if user_in.permissions is not None:
        user.permissions = user_in.permissions

    log_audit(db, current_user, "UPDATE", "USER", str(user.id), user_in.dict(exclude={"permissions"}, exclude_unset=True))
    db.commit()
    db.refresh(user)
    
    role_name = user.roles[0].name if user.roles else "none"
    return UserOut(
        id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=role_name,
        permissions=user.permissions or [],
        is_active=user.is_active
    )

