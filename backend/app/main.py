import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import close_db, init_db
from app.api.v1.api import api_router



logger = logging.getLogger(__name__)

# ========== APP LIFECYCLE EVENTS ==========


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Handle startup and shutdown events."""

    logger.info("Starting Dinarlytics Backend...")
    init_db()
    logger.info("Database initialized successfully")

    yield

    logger.info("Shutting down Dinarlytics Backend...")
    close_db()
    logger.info("Database connections closed")


# ========== FASTAPI APP INITIALIZATION ==========
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Comprehensive ERP system with AI-powered financial analysis",
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
    openapi_url=settings.OPENAPI_URL,
    lifespan=lifespan,
)
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Security Middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# GZIP Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Rate Limiting
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests, please try again later."},
    )

# Sentry Integration
import sentry_sdk
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        environment=settings.APP_ENVIRONMENT,
    )


# ========== EXCEPTION HANDLERS ==========


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request, exc):
    """Handle validation errors."""

    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def general_exception_handler(_request, exc):
    """Handle general exceptions."""

    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ========== HEALTH & INFO ENDPOINTS ==========


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENVIRONMENT,
    }


@app.get("/", tags=["info"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENVIRONMENT,
        "docs": "/api/docs",
        "endpoints": {
            "health": "/health",
            "auth": "/api/v1/auth",
            "accounting": "/api/v1/accounting",
        },
    }


# ========== API ROUTERS ==========
# ========== API ROUTERS ==========
app.include_router(api_router, prefix=settings.API_PREFIX)



# ========== WEBSOCKETS ==========
from fastapi import WebSocket, WebSocketDisconnect
from app.core.websocket import manager

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep the connection open and listen for pings/messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Configuration du logging
logging.basicConfig(level=logging.INFO)

# ============ __main__ ============

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )


