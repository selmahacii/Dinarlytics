"""
Request ID Middleware for Distributed Tracing

Generates or extracts X-Request-ID headers for request tracing across logs
and services. Essential for debugging distributed systems.
"""

import uuid
import logging
from typing import Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add X-Request-ID to all requests/responses.

    Features:
    - Extracts existing request ID from X-Request-ID header
    - Generates new UUID4 if request ID not provided
    - Stores request ID in request state for access in handlers
    - Returns request ID in response headers
    - Logs request ID with all operations for traceability
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request and add request ID header

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler

        Returns:
            Response with X-Request-ID header
        """
        # Extract existing request ID or generate new one
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

        # Store request ID in request state for access in handlers
        request.state.request_id = request_id

        # Log request start with request ID
        logger.info(
            "Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else "unknown",
            },
        )

        try:
            # Process request through middleware chain
            response = await call_next(request)

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            # Log request completion
            logger.info(
                "Request completed",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                },
            )

            return response

        except Exception as e:
            # Log request error with request ID
            logger.error(
                f"Request failed: {str(e)}",
                extra={"request_id": request_id},
                exc_info=True,
            )
            raise


def get_request_id(request: Request) -> str:
    """
    Dependency to get request ID in route handlers

    Usage in handlers:
        @router.get("/endpoint")
        def endpoint(request_id: str = Depends(get_request_id)):
            logger.info("Processing", extra={"request_id": request_id})
            return {"message": "success"}

    Args:
        request: Current request object

    Returns:
        Request ID string (UUID)
    """
    return getattr(request.state, "request_id", "unknown")


# Export for use in main.py
__all__ = ["RequestIDMiddleware", "get_request_id"]
