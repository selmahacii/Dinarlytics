"""
Configuration de sécurité et middleware pour FastAPI
Inclut: CSRF tokens, CSP headers, Security headers, Rate limiting
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from typing import Callable
from datetime import datetime, timedelta
import secrets
import hashlib
import hmac


class CSRFConfig:
    """Configuration CSRF"""
    TOKEN_LENGTH = 32
    COOKIE_NAME = "csrf_token"
    HEADER_NAME = "X-CSRF-Token"
    SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

    @staticmethod
    def generate_token() -> str:
        """Génère un token CSRF sécurisé"""
        return secrets.token_urlsafe(CSRFConfig.TOKEN_LENGTH)

    @staticmethod
    def validate_token(token: str, session_token: str, secret: str) -> bool:
        """Valide le token CSRF avec HMAC"""
        expected = hmac.new(
            secret.encode(),
            session_token.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(token, expected)


class SecurityHeaders:
    """Headers de sécurité OWASP"""

    HEADERS = {
        # Clickjacking
        "X-Frame-Options": "DENY",
        # MIME type sniffing
        "X-Content-Type-Options": "nosniff",
        # XSS Protection (Legacy, mais gardé pour vieux navigateurs)
        "X-XSS-Protection": "1; mode=block",
        # Referrer Policy
        "Referrer-Policy": "strict-origin-when-cross-origin",
        # Feature Policy / Permissions Policy
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        # HSTS (Strict-Transport-Security) - À activer en HTTPS
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    }


class CSPConfig:
    """Content Security Policy - Prévient XSS"""

    # Production policies (strict, no unsafe-inline)
    POLICIES_PRODUCTION = {
        "default-src": ["'self'"],
        "script-src": ["'self'", "cdn.tailwindcss.com"],  # ✅ Removed unsafe-inline
        "style-src": ["'self'", "cdn.tailwindcss.com"],   # ✅ Removed unsafe-inline
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
        "connect-src": ["'self'", "https://sentry.io"],  # Sentry error reporting
        "frame-ancestors": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
    }

    # Development policies (allows inline for faster iteration)
    POLICIES_DEVELOPMENT = {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
        "style-src": ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
        "connect-src": ["'self'", "api.example.com"],
        "frame-ancestors": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
    }

    @staticmethod
    def get_policies(is_production: bool = False) -> dict:
        """Get CSP policies based on environment"""
        return CSPConfig.POLICIES_PRODUCTION if is_production else CSPConfig.POLICIES_DEVELOPMENT

    @staticmethod
    def generate_policy_string(policies: dict = None, is_production: bool = False) -> str:
        """Génère la directive CSP basée sur l'environnement"""
        if policies is None:
            policies = CSPConfig.get_policies(is_production)

        directives = []
        for directive, sources in policies.items():
            directives.append(f"{directive} {' '.join(sources)}")

        return "; ".join(directives)


async def add_security_middleware(request: Request, call_next: Callable) -> Response:
    """
    Middleware pour ajouter les headers de sécurité
    À enregistrer avec: app.middleware("http")(add_security_middleware)
    """
    # Import settings to determine environment
    from app.core.config import settings

    response = await call_next(request)

    # Ajouter les headers de sécurité
    for header_name, header_value in SecurityHeaders.HEADERS.items():
        response.headers[header_name] = header_value

    # ✅ FIXED: Environment-aware CSP Header
    # Production: strict CSP without unsafe-inline
    # Development: allows unsafe-inline for faster iteration
    is_production = settings.APP_ENVIRONMENT == "production"
    response.headers["Content-Security-Policy"] = CSPConfig.generate_policy_string(
        is_production=is_production
    )

    return response


class RateLimitConfig:
    """Configuration du rate limiting"""

    # Limites par endpoint
    LIMITS = {
        "/api/v1/auth/login": "5/minute",  # Strict pour login
        "/api/v1/auth/register": "3/minute",
        "/api/v1/invoices": "100/minute",
        "/api/v1/": "200/minute",  # Limit par défaut
    }

    # Clés de stockage Redis
    REDIS_PREFIX = "rate_limit:"

    @staticmethod
    def get_rate_limit_key(request: Request) -> str:
        """
        Génère la clé de rate limiting par:
        - IP address + endpoint
        """
        client_ip = request.client.host if request.client else "unknown"
        endpoint = request.url.path
        return f"{RateLimitConfig.REDIS_PREFIX}{client_ip}:{endpoint}"


# Classes pour validation des requêtes
class RequestValidator:
    """Valide les requêtes pour détecter les attaques"""

    # Patterns d'injection SQL simples (À compléter avec WAF en production)
    DANGEROUS_PATTERNS = [
        r"(\bunion\b.*\bselect\b)",
        r"(\bdrop\b.*\btable\b)",
        r"(;\s*drop\b)",
    ]

    DANGEROUS_CHARS = ["'", '"', ";", "--", "/*", "*/"]

    @staticmethod
    def validate_input(data: str, max_length: int = 1000) -> bool:
        """
        Valide une chaîne de caractères
        TODO: Utiliser une librairie comme 'bleach' ou 'sanitize' en production
        """
        if len(data) > max_length:
            return False

        # Vérification basique
        data_lower = data.lower()
        for pattern in RequestValidator.DANGEROUS_PATTERNS:
            import re
            if re.search(pattern, data_lower, re.IGNORECASE):
                return False

        return True


class CorsPolicies:
    """Politiques CORS restrictives"""

    # À personnaliser selon votre frontend URL
    ALLOWED_ORIGINS = [
        "http://localhost:5173",  # Dev local
        "http://localhost:3000",  # Alt dev
        "https://app.dinarlytics.com",  # Production
    ]

    ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]

    ALLOWED_HEADERS = [
        "Content-Type",
        "Authorization",
        "X-CSRF-Token",
        "X-Company-ID",
    ]

    ALLOW_CREDENTIALS = True
    MAX_AGE = 600  # 10 minutes


__all__ = [
    'CSRFConfig',
    'SecurityHeaders',
    'CSPConfig',
    'RateLimitConfig',
    'RequestValidator',
    'CorsPolicies',
    'add_security_middleware',
]
