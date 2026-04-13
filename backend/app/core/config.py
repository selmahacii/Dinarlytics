import os
from datetime import timedelta
from typing import Dict, Optional

from dotenv import load_dotenv  # type: ignore[import-not-found]
from pydantic_settings import BaseSettings  # type: ignore[import-not-found]
from pydantic import Field, field_validator

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """
    Application configuration settings
    Supports environment variables and .env file
    """

    # ========== APPLICATION SETTINGS ==========
    APP_NAME: str = "Dinarlytics Backend"
    APP_VERSION: str = "1.0.0"
    APP_ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # ========== DATABASE SETTINGS ==========
    # PostgreSQL Connection
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/dinarlytics",
    )
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = DEBUG

    # ========== SECURITY SETTINGS ==========
    # JWT Configuration
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        min_length=8,
        description="Secret key for JWT signing. Must be 32+ chars in production."
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Password hashing
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True
    PASSWORD_REQUIRE_UPPERCASE: bool = True

    # ✅ VALIDATOR: Ensure production has a real SECRET_KEY
    @field_validator("SECRET_KEY", mode="after")
    @classmethod
    def validate_secret_key_for_production(cls, v: str, info) -> str:
        """Ensure production environment has a secure SECRET_KEY"""
        app_env = info.data.get("APP_ENVIRONMENT", "development")

        if app_env == "production":
            if v == "your-secret-key-change-in-production" or len(v) < 32:
                raise ValueError(
                    "CRITICAL: Production SECRET_KEY must be set to a random "
                    "32+ character value. Never use the default key. "
                    "Set the SECRET_KEY environment variable before deploying to production."
                )

        return v

    # CORS Configuration
    CORS_ORIGINS: list = [
        "http://localhost:5173",  # Frontend dev
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = [
        "Content-Type",
        "Authorization",
        "X-Company-ID",
        "x-company-id",
        "X-Requested-With",
        "Accept",
        "Origin",
    ]

    # Session Configuration
    SESSION_EXPIRE_MINUTES: int = 480  # 8 hours
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_ATTEMPT_TIMEOUT_MINUTES: int = 15

    # ========== API SETTINGS ==========
    API_PREFIX: str = "/api/v1"
    DOCS_URL: Optional[str] = "/api/docs" if DEBUG else None
    REDOC_URL: Optional[str] = "/api/redoc" if DEBUG else None
    OPENAPI_URL: Optional[str] = "/api/openapi.json" if DEBUG else None

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD_SECONDS: int = 60

    # ========== LOGGING SETTINGS ==========
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = "logs/backend.log"

    # ========== FILE UPLOAD SETTINGS ==========
    UPLOAD_FOLDER: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 100
    ALLOWED_EXTENSIONS: list = [
        "pdf",
        "xlsx",
        "xls",
        "csv",
        "png",
        "jpg",
        "jpeg",
    ]

    # ========== EXTERNAL SERVICES ==========
    # Email Configuration
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", "")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "noreply@dinarlytics.com")

    # Sentry (Error Tracking)
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN", None)

    # ========== OBSERVABILITY SETTINGS (OpenTelemetry) ==========
    # Distributed Tracing
    OTEL_ENABLED: bool = os.getenv("OTEL_ENABLED", "false").lower() == "true"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = os.getenv(
        "OTEL_EXPORTER_OTLP_ENDPOINT",
        "http://localhost:4317"  # Jaeger collector endpoint
    )

    # ========== AI SERVICE SETTINGS ==========
    AI_MODEL_PATH: str = "models/"
    AI_FEATURE_STORE_ENABLED: bool = True
    AI_DRIFT_DETECTION_ENABLED: bool = True

    # ========== FEATURE FLAGS ==========
    FEATURE_TWO_FACTOR_AUTH: bool = False
    FEATURE_AUDIT_LOGGING: bool = True
    FEATURE_DATA_ENCRYPTION: bool = True
    FEATURE_API_VERSIONING: bool = True

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",
    }


# Create settings instance
settings = Settings()

# ========== SECURITY CONSTANTS ==========
ACCESS_TOKEN_EXPIRE = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
REFRESH_TOKEN_EXPIRE = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

# Roles & Permissions
ROLES = {
    "admin": {
        "permissions": [
            "read",
            "create",
            "update",
            "delete",
            "approve",
            "manage_users",
            "manage_roles",
        ]
    },
    "comptable": {
        "permissions": [
            "read",
            "create",
            "update",
            "approve_entries",
            "export",
        ]
    },
    "analyste_financier": {
        "permissions": ["read", "export", "generate_reports"]
    },
    "manager": {"permissions": ["read", "create", "update", "export"]},
    "employee": {"permissions": ["read"]},
}

# Document Access Levels by Role
DOCUMENT_ACCESS_LEVELS = {
    "invoice": {
        "admin": ["view", "create", "edit", "delete", "sign", "export"],
        "comptable": ["view", "create", "edit", "sign", "export"],
        "manager": ["view", "edit", "export"],
        "employee": ["view"],
    },
    "journal_entry": {
        "admin": ["view", "create", "edit", "delete", "approve"],
        "comptable": ["view", "create", "edit"],
        "analyste_financier": ["view"],
        "manager": ["view", "approve"],
    },
    "delivery_note": {
        "admin": ["view", "create", "edit", "delete", "sign"],
        "comptable": ["view", "create", "edit"],
        "manager": ["view", "edit"],
        "employee": ["view"],
    },
    "purchase_order": {
        "admin": ["view", "create", "edit", "delete", "approve"],
        "comptable": ["view", "create", "edit"],
        "manager": ["view", "approve"],
        "employee": ["view"],
    },
}

MODEL_CONFIG: Dict[str, dict] = {
    "erp_multitask_v1": {
        "input_dim": 20,
        "hidden_dim": 128,
        "n_layers": 2,
        "task_outputs": {
            "risk": 1,  # Score de risque financier (0-1)
            "liquidity": 1,  # Score de liquidit???? (0-1)
            "profitability": 1,  # Score de rentabilit???? (0-1)
            "solvency": 1,  # Score de solvabilit???? (0-1)
            "anomaly": 1,  # D????tection d'anomalies (0-1)
            "suggestion": 5,  # Suggestions d'am????lioration (5 cat????gories)
        },
    "model_path": None,
    }
}

IMPROVEMENT_CATEGORIES = [
    "Optimisation des couts",
    "Gestion de la tresorerie",
    "Reduction des risques",
    "Efficacite operationnelle",
    "Strategie de croissance"
]
