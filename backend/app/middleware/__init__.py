"""
FastAPI Middleware Components

Includes:
- RequestIDMiddleware: Request tracing with X-Request-ID headers
- Additional middleware for observability, security, and logging
"""

from app.middleware.request_id import RequestIDMiddleware, get_request_id

__all__ = ["RequestIDMiddleware", "get_request_id"]
