"""
Middleware CSRF (Cross-Site Request Forgery Protection)
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import logging

from app.core.security_config import CSRFConfig

logger = logging.getLogger(__name__)


class CSRFMiddleware(BaseHTTPMiddleware):
    """
    Middleware CSRF protection

    Fonctionnement:
    1. GET: Retourne un CSRF token dans le cookie
    2. POST/PUT/DELETE/PATCH: Valide le token dans le header X-CSRF-Token

    Usage dans main.py:
    app.add_middleware(CSRFMiddleware, secret_key="YOUR_SECRET")
    """

    def __init__(self, app, secret_key: str):
        super().__init__(app)
        self.secret_key = secret_key
        # Endpoints qui ne nécessitent pas CSRF
        self.exempt_paths = {
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/health",
            "/api/docs",
            "/api/openapi.json",
            "/api/redoc",
        }

    async def dispatch(self, request: Request, call_next: Callable) -> Callable:
        # Récupérer ou générer le token CSRF
        csrf_token = request.cookies.get(CSRFConfig.COOKIE_NAME)

        if not csrf_token:
            # Générer un nouveau token
            csrf_token = CSRFConfig.generate_token()

        if request.method in CSRFConfig.SAFE_METHODS:
            response = await call_next(request)
            
            # Ne pas mettre de cookie sur les requêtes OPTIONS (interfère avec CORS)
            if request.method == "OPTIONS":
                return response

            response.headers[CSRFConfig.HEADER_NAME] = csrf_token
            # Determine if we should use secure cookies based on request scheme
            is_secure = request.url.scheme == "https"
            
            response.set_cookie(
                CSRFConfig.COOKIE_NAME,
                csrf_token,
                httponly=True,
                secure=is_secure,
                samesite="lax",
                max_age=3600,  # 1 heure
            )
            return response

        # Pour les autres méthodes (POST, PUT, DELETE, PATCH)
        if request.url.path not in self.exempt_paths:
            # Récupérer le token du header
            token_from_header = request.headers.get(CSRFConfig.HEADER_NAME)

            if not token_from_header:
                logger.warning(
                    f"CSRF token missing in request to {request.url.path} from {request.client.host}"
                )
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"error": "CSRF token missing", "detail": f"Header {CSRFConfig.HEADER_NAME} required"},
                )

            # Valider le token
            if token_from_header != csrf_token:
                logger.warning(
                    f"CSRF token mismatch for {request.url.path} from {request.client.host}"
                )
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"error": "CSRF token invalid", "detail": "Token mismatch or expired"},
                )

        response = await call_next(request)

        # Re-définir le cookie avec le token
        is_secure = request.url.scheme == "https"
        response.headers[CSRFConfig.HEADER_NAME] = csrf_token
        
        response.set_cookie(
            CSRFConfig.COOKIE_NAME,
            csrf_token,
            httponly=True,
            secure=is_secure,
            samesite="lax",
            max_age=3600,
        )

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware Rate Limiting - À utiliser avec slowapi ou redis

    Usage:
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    """

    def __init__(self, app):
        super().__init__(app)
        # TODO: Intégrer Redis ou slowapi
        pass

    async def dispatch(self, request: Request, call_next: Callable) -> Callable:
        response = await call_next(request)
        return response


__all__ = ['CSRFMiddleware', 'RateLimitMiddleware']
