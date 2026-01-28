from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from jose import JWTError, jwt  # type: ignore[import-not-found]  # noqa: E0401
from passlib.context import CryptContext  # type: ignore[import-not-found]  # noqa: E0401
from pydantic import BaseModel, Field
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# ========== PASSWORD HASHING ==========
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordManager:
    """Manages password hashing and verification"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Validate password strength according to requirements
        Returns: (is_valid, error_message)
        """
        if len(password) < settings.PASSWORD_MIN_LENGTH:
            min_len_msg = (
                "Password must be at least "
                f"{settings.PASSWORD_MIN_LENGTH} characters"
            )
            return False, min_len_msg

        if settings.PASSWORD_REQUIRE_UPPERCASE and not any(
            c.isupper() for c in password
        ):
            return False, "Password must contain at least one uppercase letter"

        if settings.PASSWORD_REQUIRE_NUMBERS and not any(
            c.isdigit() for c in password
        ):
            return False, "Password must contain at least one number"

        if settings.PASSWORD_REQUIRE_SPECIAL_CHARS and not any(
            c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password
        ):
            return (
                False,
                "Password must contain at least one special character",
            )

        return True, ""


# ========== JWT TOKEN MODELS ==========
class TokenData(BaseModel):
    """JWT token payload data"""

    user_id: str
    username: str
    email: str
    company_id: str
    roles: List[str] = Field(default_factory=list)
    permissions: List[str] = Field(default_factory=list)
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None
    type: str = "access"  # access or refresh


class AccessToken(BaseModel):
    """Access token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Request model for token refresh"""

    refresh_token: str


# ========== JWT TOKEN MANAGER ==========
class JWTManager:
    """Manages JWT token creation, validation, and refresh"""

    @staticmethod
    def create_access_token(
        user_id: str,
        username: str,
        email: str,
        company_id: str,
        roles: list[str] | None = None,
        permissions: list[str] | None = None,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """Create an access JWT token"""
        if expires_delta is None:
            expires_delta = timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )

        now = datetime.now(timezone.utc)
        expire = now + expires_delta

        data = {
            "user_id": user_id,
            "username": username,
            "email": email,
            "company_id": company_id,
            "roles": roles or [],
            "permissions": permissions or [],
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "type": "access",
        }

        encoded_jwt = jwt.encode(
            data, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )

        logger.info("Access token created for user %s", username)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(
        user_id: str,
        username: str,
        email: str,
        company_id: str,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """Create a refresh JWT token"""
        if expires_delta is None:
            expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        now = datetime.now(timezone.utc)
        expire = now + expires_delta

        data = {
            "user_id": user_id,
            "username": username,
            "email": email,
            "company_id": company_id,
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "type": "refresh",
        }

        encoded_jwt = jwt.encode(
            data, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )

        logger.info("Refresh token created for user %s", username)
        return encoded_jwt

    @staticmethod
    def verify_token(
        token: str, token_type: str = "access"
    ) -> Optional[TokenData]:
        """
        Verify and decode a JWT token
        Returns TokenData if valid, None if invalid
        """
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )

            # Verify token type
            if payload.get("type") != token_type:
                logger.warning(
                    "Token type mismatch: expected %s, got %s",
                    token_type,
                    payload.get("type"),
                )
                return None

            # Create TokenData object
            token_data = TokenData(
                user_id=payload.get("user_id"),
                username=payload.get("username"),
                email=payload.get("email"),
                company_id=payload.get("company_id"),
                roles=payload.get("roles", []),
                permissions=payload.get("permissions", []),
                type=payload.get("type"),
            )

            return token_data

        except JWTError as exc:
            logger.error("JWT verification failed: %s", exc)
            return None


# ========== RBAC - ROLE BASED ACCESS CONTROL ==========
class RBACManager:
    """Manages role-based access control"""

    @staticmethod
    def check_permission(roles: List[str], required_permission: str) -> bool:
        """Check if user has required permission based on roles"""
        from app.config import ROLES

        for role in roles:
            if role in ROLES:
                if required_permission in ROLES[role]["permissions"]:
                    return True

        return False

    @staticmethod
    def check_document_access(
        role: str, document_type: str, action: str
    ) -> bool:
        """Check if user can access a specific document with an action"""
        from app.config import DOCUMENT_ACCESS_LEVELS

        if document_type not in DOCUMENT_ACCESS_LEVELS:
            return False

        if role not in DOCUMENT_ACCESS_LEVELS[document_type]:
            return False

        allowed_actions = DOCUMENT_ACCESS_LEVELS[document_type][role]
        return action in allowed_actions

    @staticmethod
    def get_user_permissions(roles: List[str]) -> List[str]:
        """Get all permissions for a user based on roles"""
        from app.config import ROLES

        permissions = set()
        for role in roles:
            if role in ROLES:
                permissions.update(ROLES[role]["permissions"])

        return list(permissions)


import redis
import json
import os

# Redis connection for sessions and rate limiting
redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)

# ========== SESSION MANAGER ==========
class SessionManager:
    """Manages user sessions and login attempts using Redis for cross-instance consistency."""

    @staticmethod
    def create_session(
        user_id: str, company_id: str, ip_address: str, user_agent: str
    ) -> str:
        """Create a new user session in Redis"""
        session_id = f"sess:{user_id}:{int(datetime.now(timezone.utc).timestamp())}"
        
        session_data = {
            "user_id": user_id,
            "company_id": company_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_activity": datetime.now(timezone.utc).isoformat(),
        }

        # Set session with expiration
        redis_client.setex(
            session_id,
            settings.SESSION_EXPIRE_MINUTES * 60,
            json.dumps(session_data)
        )

        logger.info("Session created in Redis for user %s", user_id)
        return session_id

    @staticmethod
    def get_session(session_id: str) -> Optional[Dict[str, Any]]:
        """Get session details from Redis if valid and not expired"""
        data = redis_client.get(session_id)
        if not data:
            return None

        session = json.loads(data)
        
        # Update last activity and extend expiration
        session["last_activity"] = datetime.now(timezone.utc).isoformat()
        redis_client.setex(
            session_id,
            settings.SESSION_EXPIRE_MINUTES * 60,
            json.dumps(session)
        )
        
        return session

    @staticmethod
    def invalidate_session(session_id: str) -> bool:
        """Invalidate a session in Redis"""
        result = redis_client.delete(session_id)
        if result:
            logger.info("Session invalidated in Redis: %s", session_id)
            return True
        return False

    @staticmethod
    def record_login_attempt(username: str, success: bool) -> bool:
        """
        Record a login attempt in Redis.
        """
        key = f"login_attempts:{username}"
        
        if success:
            redis_client.delete(key)
            return True
            
        # Increment attempts
        attempts = redis_client.incr(key)
        if attempts == 1:
            redis_client.expire(key, settings.LOGIN_ATTEMPT_TIMEOUT_MINUTES * 60)
            
        if attempts >= settings.MAX_LOGIN_ATTEMPTS:
            logger.warning("Too many login attempts for user %s", username)
            return False
            
        return True

# ========== RATE LIMITER ==========
class RateLimiter:
    """Simple Redis-based rate limiter"""
    
    @staticmethod
    def is_rate_limited(key: str, limit: int, period: int) -> bool:
        """Check if a key is within rate limits"""
        if not settings.RATE_LIMIT_ENABLED:
            return False
            
        redis_key = f"rate_limit:{key}"
        current = redis_client.get(redis_key)
        
        if current and int(current) >= limit:
            return True
            
        pipe = redis_client.pipeline()
        pipe.incr(redis_key)
        if not current:
            pipe.expire(redis_key, period)
        pipe.execute()
        
        return False
