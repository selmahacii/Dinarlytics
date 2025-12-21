"""
API Routers Package
"""

from . import auth
from . import accounting
from . import documents
from . import budgets

from .audit import router as audit_router
# from .ai import router as ai_router  # Requires torch, not installed
# from .training import router as training_router  # Requires torch

__all__ = [
    "auth", "accounting", "documents", "budgets", "audit_router"
]
