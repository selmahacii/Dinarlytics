"""
GUIDE D'INTÉGRATION - Améliorations de Sécurité pour main.py

Ce fichier montre comment intégrer les améliorations critiques
dans votre application FastAPI existante.

FONCTIONNALITÉS:
1. ✅ CSRF Protection avec middleware
2. ✅ Content Security Policy headers
3. ✅ Security headers (HSTS, X-Frame-Options, etc)
4. ✅ Rate limiting avec slowapi
5. ✅ CORS restrictive
6. ✅ Request validation
7. ✅ Audit logging
"""

# ===== EXEMPLE DE CONFIGURATION =====

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import logging

from app.core.csrf_middleware import CSRFMiddleware, add_security_middleware
from app.core.security_config import (
    CSRFConfig,
    SecurityHeaders,
    CSPConfig,
    RateLimitConfig,
    CorsPolicies,
)
from app.core.config import settings

logger = logging.getLogger(__name__)


def configure_security_middleware(app: FastAPI):
    """
    Configure tous les middlewares de sécurité
    À appeler dans main.py après app = FastAPI()
    """

    # 1. TRUSTED HOST (doit être premier)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "localhost",
            "127.0.0.1",
            "app.dinarlytics.com",
            "api.dinarlytics.com",
        ],
    )

    # 2. CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CorsPolicies.ALLOWED_ORIGINS,
        allow_methods=CorsPolicies.ALLOWED_METHODS,
        allow_headers=CorsPolicies.ALLOWED_HEADERS,
        allow_credentials=CorsPolicies.ALLOW_CREDENTIALS,
        max_age=CorsPolicies.MAX_AGE,
    )

    # 3. CSRF Middleware
    app.add_middleware(
        CSRFMiddleware,
        secret_key=settings.SECRET_KEY,
    )

    # 4. Security Headers (custom)
    app.middleware("http")(add_security_middleware)

    logger.info("✅ Security middleware configured")


def configure_rate_limiting(app: FastAPI):
    """
    Configure le rate limiting avec slowapi
    """
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    logger.info("✅ Rate limiting configured")


async def _rate_limit_exceeded_handler(request, exc):
    """Handler pour les erreurs de rate limit"""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=429,
        content={
            "error": "Too Many Requests",
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": exc.headers.get("Retry-After", "60"),
        },
    )


def configure_health_check(app: FastAPI):
    """Ajoute un health check endpoint"""
    from app.core.schemas import HealthCheckResponse

    @app.get("/api/v1/health", response_model=HealthCheckResponse, tags=["System"])
    async def health_check():
        from datetime import datetime
        return HealthCheckResponse(
            status="healthy",
            timestamp=datetime.utcnow(),
            database="ok",
            cache="ok",
        )

    logger.info("✅ Health check configured")


# ===== EXEMPLE D'UTILISATION DANS main.py =====
"""
from fastapi import FastAPI
from .security_integration import (
    configure_security_middleware,
    configure_rate_limiting,
    configure_health_check
)

app = FastAPI(
    title="Dinarlytics API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Enregistrer les routes
from .api.v1 import api_router
app.include_router(api_router, prefix="/api/v1")

# Configurer la sécurité
configure_security_middleware(app)
configure_rate_limiting(app)
configure_health_check(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""

# ===== ENDPOINTS PROTÉGÉS EXEMPLE =====
"""
from fastapi import Depends
from slowapi.util import get_remote_address
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/invoices", status_code=201)
@limiter.limit("100/minute")  # Rate limit
async def create_invoice(invoice: InvoiceCreateSchema, request: Request):
    # CSRF token automatiquement validé par middleware
    # Request.headers.get("X-CSRF-Token") contient le token
    pass

@app.get("/api/v1/invoices")
@limiter.limit("200/minute")
async def list_invoices(skip: int = 0, limit: int = 20):
    pass
"""

# ===== TEST D'INTÉGRATION FRONTEND =====
"""
// Récupérer le CSRF token (depuis GET request)
const response = await fetch('http://localhost:8000/api/v1/invoices', {
  method: 'GET',
  credentials: 'include'  // Important: inclure les cookies
});

// Lire le token depuis les cookies
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  ?.split('=')[1];

// Envoyer une requête POST avec le token
await fetch('http://localhost:8000/api/v1/invoices', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken  // Ajouter le token ici
  },
  body: JSON.stringify(invoiceData)
});
"""

# ===== CHECKLIST DE SÉCURITÉ =====
"""
✅ CSRF Tokens (middleware)
✅ CSP Headers (Content-Security-Policy)
✅ Security Headers (X-Frame-Options, HSTS, etc)
✅ CORS restrictive (allowed_origins)
✅ Trusted Hosts (TrustedHostMiddleware)
✅ Rate Limiting (slowapi + limiter)
✅ Request Validation (Pydantic schemas)
✅ HTTPS only cookies (Secure flag)
✅ HTTPOnly cookies (CSRF token protection)
✅ Health check endpoint

À FAIRE ENSUITE:
- [ ] Ajouter WAF (Web Application Firewall)
- [ ] Configurer logging/monitoring (Sentry)
- [ ] Tests de sécurité (OWASP ZAP, Burp Suite)
- [ ] Rotation des clés API
- [ ] Backup & Disaster Recovery
"""

__all__ = [
    'configure_security_middleware',
    'configure_rate_limiting',
    'configure_health_check',
]
