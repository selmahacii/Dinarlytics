"""
Permission and authorization utilities for role-based access control
Decorators and functions to enforce permissions on API endpoints
"""

from functools import wraps
from typing import List, Optional, Callable, Any
from datetime import datetime
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from starlette.authentication import AuthCredentials
from sqlalchemy.orm import Session
import logging

from app.core.security import JWTManager
from app.core.database import get_db
from app.core.models import AuditLog

logger = logging.getLogger(__name__)

# ========== PERMISSION DEFINITIONS ==========

# Define available permissions by category
PERMISSION_CATEGORIES = {
    'comptabilite': [
        'comptabilite-read',
        'comptabilite-write',
        'comptabilite-validate',
        'comptabilite-close'
    ],
    'facturation': [
        'facturation-read',
        'facturation-create',
        'facturation-validate',
        'facturation-cancel'
    ],
    'stocks': [
        'stocks-read',
        'stocks-move',
        'stocks-inventory'
    ],
    'rapports': [
        'rapports-basic',
        'rapports-advanced',
        'rapports-create',
        'export-data'
    ],
    'audit': [
        'audit-read',
        'audit-full'
    ],
    'admin': [
        'admin-users',
        'admin-settings',
        'admin-backup'
    ],
    'lia': [
        'lia-access',
        'lia-chatbot',
        'lia-analyses',
        'lia-train'
    ],
    'clients': [
        'clients-manage'
    ],
    'fournisseurs': [
        'fournisseurs-manage'
    ],
    'articles': [
        'articles-manage'
    ]
}

# ========== ROLE DEFINITIONS ==========

# ========== ROLE DEFINITIONS (Hierarchical & Professional) ==========

ROLE_PERMISSIONS = {
    # The five role names below are the ones actually seeded into the
    # `roles` table (see app.core.config.ROLES / seed_all.py) and are what
    # ends up in TokenData.roles at runtime. require_permission() checks
    # against these keys, so they must stay in sync with the seeded roles
    # or every granular permission check silently denies real users.
    'admin': list(sum(PERMISSION_CATEGORIES.values(), [])),

    'comptable': [
        'comptabilite-read', 'comptabilite-write', 'comptabilite-validate',
        'facturation-read', 'facturation-create', 'facturation-validate',
        'stocks-read', 'stocks-move',
        'rapports-basic', 'rapports-advanced', 'rapports-create', 'export-data',
        'audit-read',
        'lia-access', 'lia-chatbot', 'lia-analyses'
    ],

    'analyste_financier': [
        'comptabilite-read',
        'facturation-read',
        'stocks-read',
        'rapports-basic', 'rapports-advanced', 'rapports-create', 'export-data',
        'audit-read',
        'lia-access', 'lia-analyses'
    ],

    'manager': [
        'clients-manage', 'fournisseurs-manage', 'articles-manage',
        'facturation-read', 'facturation-create',
        'stocks-read', 'stocks-move',
        'rapports-basic', 'rapports-advanced', 'export-data',
        'lia-access', 'lia-chatbot'
    ],

    'employee': [
        'facturation-read',
        'stocks-read',
        'rapports-basic',
        'lia-access'
    ],

    # Legacy/aspirational role names kept for forward-compatibility with a
    # richer role hierarchy that isn't seeded yet (not currently assignable
    # to a real user, since seed_all.py only creates the five roles above).
    'directeur': list(sum(PERMISSION_CATEGORIES.values(), [])),

    'expert-comptable': list(sum(PERMISSION_CATEGORIES.values(), [])), # All access except user management of other admins
    
    'comptable-senior': [
        'comptabilite-read', 'comptabilite-write', 'comptabilite-validate', 'comptabilite-close',
        'facturation-read', 'facturation-create', 'facturation-validate', 'facturation-cancel',
        'stocks-read', 'stocks-move', 'stocks-inventory',
        'rapports-basic', 'rapports-advanced', 'rapports-create', 'export-data',
        'audit-read', 'audit-full',
        'lia-access', 'lia-chatbot', 'lia-analyses', 'lia-train'
    ],

    'gestionnaire-ventes': [
        'clients-manage',
        'facturation-read', 'facturation-create',
        'stocks-read',
        'rapports-basic',
        'lia-access', 'lia-chatbot'
    ],
    
    'gestionnaire-stocks': [
        'stocks-read', 'stocks-move', 'stocks-inventory',
        'fournisseurs-manage',
        'rapports-basic'
    ],
    
    'auditeur': [
        'comptabilite-read',
        'facturation-read',
        'stocks-read',
        'rapports-basic', 'rapports-advanced',
        'audit-read', 'audit-full',
        'lia-access'
    ],
    
    'consultant': [
        'rapports-basic',
        'lia-access', 'lia-chatbot'
    ]
}

# ========== PERMISSION CHECKER ==========

class PermissionChecker:
    """Utility class to check user permissions"""
    
    @staticmethod
    def get_user_permissions(roles: List[str]) -> set:
        """Get all permissions for a list of roles"""
        permissions = set()
        for role in roles:
            if role in ROLE_PERMISSIONS:
                permissions.update(ROLE_PERMISSIONS[role])
        return permissions
    
    @staticmethod
    def has_permission(user_roles: List[str], required_permission: str) -> bool:
        """Check if user has a specific permission"""
        user_permissions = PermissionChecker.get_user_permissions(user_roles)
        return required_permission in user_permissions
    
    @staticmethod
    def has_any_permission(user_roles: List[str], permissions: List[str]) -> bool:
        """Check if user has at least one of the required permissions"""
        user_permissions = PermissionChecker.get_user_permissions(user_roles)
        return any(perm in user_permissions for perm in permissions)
    
    @staticmethod
    def has_all_permissions(user_roles: List[str], permissions: List[str]) -> bool:
        """Check if user has all of the required permissions"""
        user_permissions = PermissionChecker.get_user_permissions(user_roles)
        return all(perm in user_permissions for perm in permissions)

# ========== DEPENDENCY INJECTION FUNCTIONS ==========

security = HTTPBearer()

async def get_current_user_from_token(credentials = Depends(security)):
    """Extract and validate token from request header"""
    token = credentials.credentials
    
    try:
        payload = JWTManager.verify_token(token, token_type="access")
        user_id = payload.get("user_id")
        roles = payload.get("roles", [])
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )
        
        return {
            "user_id": user_id,
            "username": payload.get("username"),
            "email": payload.get("email"),
            "company_id": payload.get("company_id"),
            "roles": roles,
            "permissions": payload.get("permissions", [])
        }
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

def require_permission(required_permission: str):
    """Dependency to require a specific permission"""
    async def check_permission(user = Depends(get_current_user_from_token)):
        if not PermissionChecker.has_permission(user["roles"], required_permission):
            logger.warning(
                f"User {user['user_id']} denied access: missing permission {required_permission}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {required_permission}"
            )
        return user
    return check_permission

def require_any_permission(permissions: List[str]):
    """Dependency to require at least one of several permissions"""
    async def check_permissions(user = Depends(get_current_user_from_token)):
        if not PermissionChecker.has_any_permission(user["roles"], permissions):
            logger.warning(
                f"User {user['user_id']} denied access: missing any of {permissions}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing at least one of required permissions: {permissions}"
            )
        return user
    return check_permissions

def require_all_permissions(permissions: List[str]):
    """Dependency to require all of several permissions"""
    async def check_permissions(user = Depends(get_current_user_from_token)):
        if not PermissionChecker.has_all_permissions(user["roles"], permissions):
            logger.warning(
                f"User {user['user_id']} denied access: missing all of {permissions}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing all required permissions: {permissions}"
            )
        return user
    return check_permissions

async def require_role(required_role: str):
    """Dependency to require a specific role"""
    async def check_role(user = Depends(get_current_user_from_token)):
        if required_role not in user["roles"]:
            logger.warning(
                f"User {user['user_id']} denied access: missing role {required_role}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required role: {required_role}"
            )
        return user
    return check_role

async def require_any_role(roles: List[str]):
    """Dependency to require at least one of several roles"""
    async def check_roles(user = Depends(get_current_user_from_token)):
        if not any(role in user["roles"] for role in roles):
            logger.warning(
                f"User {user['user_id']} denied access: missing any of {roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing at least one of required roles: {roles}"
            )
        return user
    return check_roles

# ========== AUDIT LOGGING ==========

def log_sensitive_access(action: str, user_id: str, details: dict = None, request: Request = None, db: Session = None):
    """Log access to sensitive resources for audit trail (enregistre en base)"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "user_id": user_id,
        "details": details or {}
    }
    logger.warning(f"SENSITIVE_ACCESS: {log_entry}")
    # Enregistrement en base si session fournie
    if db is not None:
        ip_address = None
        user_agent = None
        if request is not None:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
        audit = AuditLog(
            user_id=user_id,
            company_id=details.get("company_id") if details else None,
            action=action,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(audit)
        db.commit()

# ========== AUTHORIZATION DECORATORS ==========

def permission_required(permission: str):
    """Decorator to check permission on a function"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user from kwargs (injected by FastAPI)
            user = kwargs.get('user')
            if not user or not PermissionChecker.has_permission(user.get('roles', []), permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: {permission}"
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def audit_log(action: str):
    """Decorator to log sensitive actions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get('user')
            user_id = user.get('user_id') if user else 'unknown'
            
            logger.info(f"AUDIT: Action '{action}' by user {user_id}")
            
            result = await func(*args, **kwargs)
            return result
        return wrapper
    return decorator
