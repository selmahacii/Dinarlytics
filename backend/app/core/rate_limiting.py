"""
Configuration detaillée du Rate Limiting pour la production
Utilise slowapi + Redis
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class RateLimitingConfig:
    """
    Configuration du rate limiting par endpoint et par type d'utilisateur
    """

    # Limites globales (requests par minute)
    DEFAULT_LIMIT = "200/minute"

    # Limites spécifiques par endpoint
    ENDPOINT_LIMITS = {
        # Authentication - Très strict
        "auth:login": "5/minute",
        "auth:register": "3/minute",
        "auth:refresh_token": "20/minute",

        # Public endpoints
        "health": "1000/minute",  # Health check peut être appelé souvent

        # Invoice operations
        "invoice:create": "100/minute",
        "invoice:list": "200/minute",
        "invoice:update": "100/minute",
        "invoice:delete": "50/minute",

        # Client operations
        "client:create": "50/minute",
        "client:list": "200/minute",
        "client:update": "100/minute",

        # Financial data (souvent consultée)
        "analytics:dashboard": "500/minute",
        "analytics:kpis": "300/minute",

        # Export (peut être lourd)
        "export:pdf": "10/minute",
        "export:excel": "10/minute",

        # File upload (stricte)
        "upload": "5/minute",

        # AI endpoints (peuvent être coûteux)
        "ai:predict": "20/minute",
        "ai:analyze": "30/minute",
    }

    # Limites par rôle utilisateur
    USER_ROLE_LIMITS = {
        "admin": "2000/minute",     # Admins ont plus de requêtes
        "manager": "500/minute",
        "user": "200/minute",       # Utilisateurs normaux
        "guest": "50/minute",       # Guests très limités
    }

    # Limites par type de client
    CLIENT_LIMITS = {
        "web": "500/minute",
        "mobile": "300/minute",
        "api": "1000/minute",
    }


def get_rate_limit_key(request: Request) -> str:
    """
    Génère une clé de rate limiting personnalisée
    Prend en compte: IP + User ID + Device type
    """
    # IP address
    client_ip = request.client.host if request.client else "unknown"

    # User ID (si authentifié)
    user_id = getattr(request.state, "user_id", None)
    user_part = f":{user_id}" if user_id else ""

    # Device/Client type (depuis header)
    client_type = request.headers.get("X-Client-Type", "web")

    return f"{client_ip}{user_part}:{client_type}"


def get_rate_limit_for_endpoint(request: Request) -> str:
    """
    Détermine la limite de rate limiting pour le endpoint actuel
    Basé sur: endpoint + rôle utilisateur
    """
    endpoint_path = request.url.path
    user_role = getattr(request.state, "user_role", "guest")

    # Chercher une limite spécifique
    for endpoint_key, limit in RateLimitingConfig.ENDPOINT_LIMITS.items():
        if endpoint_key in endpoint_path:
            # Ajuster selon le rôle
            role_multiplier = {
                "admin": 3.0,
                "manager": 1.5,
                "user": 1.0,
                "guest": 0.5,
            }.get(user_role, 1.0)

            # Parse la limite (ex: "100/minute")
            value, unit = limit.split("/")
            adjusted = int(float(value) * role_multiplier)
            return f"{adjusted}/{unit}"

    return RateLimitingConfig.DEFAULT_LIMIT


def setup_rate_limiting(app: FastAPI) -> Limiter:
    """
    Configure le rate limiting pour l'application FastAPI
    """
    # Créer le limiter
    limiter = Limiter(
        key_func=get_rate_limit_key,
        default_limits=[RateLimitingConfig.DEFAULT_LIMIT],
        storage_uri="memory://",  # TODO: Utiliser Redis en production
        # storage_uri="redis://localhost:6379/0",
        strategy="fixed-window",  # fixed-window ou moving-window
    )

    # Ajouter le middleware
    app.add_middleware(SlowAPIMiddleware)

    # Enregistrer le handler d'erreur
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "error": "Too Many Requests",
                "detail": "Rate limit exceeded. Please try again later.",
                "retry_after": exc.headers.get("Retry-After", "60"),
            },
            headers={"Retry-After": exc.headers.get("Retry-After", "60")},
        )

    logger.info("✅ Rate limiting configured")
    return limiter


# ===== EXEMPLE D'UTILISATION DANS LES ENDPOINTS =====

"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/auth/login", tags=["auth"])
@limiter.limit("5/minute")
async def login(credentials: LoginSchema, request: Request):
    # Très limité pour prévenir les brute force attacks
    pass

@app.get("/api/v1/invoices", tags=["invoices"])
@limiter.limit("200/minute")
async def list_invoices(request: Request, skip: int = 0, limit: int = 20):
    pass

@app.post("/api/v1/invoices", tags=["invoices"])
@limiter.limit("100/minute")
async def create_invoice(request: Request, invoice: InvoiceCreateSchema):
    pass

@app.post("/api/v1/export/pdf", tags=["export"])
@limiter.limit("10/minute")
async def export_to_pdf(request: Request):
    # Export lourd, très limitée
    pass

@app.post("/api/v1/ai/predict", tags=["ai"])
@limiter.limit("20/minute")
async def ai_predict(request: Request, data: dict):
    # Peut être coûteux en resources
    pass
"""

# ===== CONFIGURATION REDIS (PRODUCTION) =====

"""
# Installer redis:
pip install redis

# Dans config.py:
REDIS_URL = "redis://localhost:6379/0"  # ou depuis envvar

# Dans setup_rate_limiting:
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=REDIS_URL,
    strategy="moving-window",  # Plus précis en production
)
"""

# ===== MONITORING ET ALERTES =====

"""
Mettre en place des alertes pour:
- Taux de 429 (rate limit exceeded) > 5%
- Pic d'attaques détectées
- Anomalies dans les patterns de requêtes

Utilisez Sentry ou Datadog pour cela.
"""

__all__ = [
    'RateLimitingConfig',
    'get_rate_limit_key',
    'get_rate_limit_for_endpoint',
    'setup_rate_limiting',
]
