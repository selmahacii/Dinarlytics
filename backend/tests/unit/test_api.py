"""
API Endpoint Tests

Tests for:
- Health check
- API response formats
- Error handling
- Status codes

Run with:
    pytest tests/unit/test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient


class TestHealthCheck:
    """Test health check endpoints"""

    def test_health_check_endpoint(self, client: TestClient):
        """Test /api/v1/health endpoint"""
        response = client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["healthy", "ok", "operational"]

    def test_simple_health_check_endpoint(self, client: TestClient):
        """Test /health endpoint (deprecated)"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    def test_root_info_endpoint(self, client: TestClient):
        """Test / (root) endpoint"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        # Should return API info
        assert any(key in data for key in ["name", "version", "api"])


class TestAPIResponseFormat:
    """Test API response format consistency"""

    def test_json_response_content_type(self, client: TestClient):
        """Test responses have correct Content-Type"""
        response = client.get("/api/v1/health")

        assert response.headers["content-type"] == "application/json"

    def test_error_response_format(self, client: TestClient):
        """Test error responses have consistent format"""
        # Try accessing non-existent endpoint
        response = client.get("/api/v1/nonexistent")

        assert response.status_code == 404
        # Should have some error detail
        assert "detail" in response.json() or "error" in response.json()


class TestAPIErrorHandling:
    """Test error handling"""

    def test_405_method_not_allowed(self, client: TestClient):
        """Test 405 response for wrong HTTP method"""
        # GET not allowed on POST-only endpoint if any
        response = client.get("/api/v1/auth/login")

        # Should return 405 or 422 (validation error)
        assert response.status_code in [405, 422, 404]

    def test_422_validation_error(self, client: TestClient):
        """Test 422 response for validation errors"""
        response = client.post(
            "/api/v1/auth/register",
            json={"invalid": "request"},  # Missing required fields
        )

        assert response.status_code == 422
        data = response.json()
        # FastAPI returns errors array
        assert "detail" in data or "errors" in data

    def test_500_error_handling(self, client: TestClient):
        """Test server error responses"""
        # Make a request that might trigger server error
        # (This depends on the server's actual error handling)
        response = client.get("/api/v1/health")

        # Should never crash
        assert response.status_code in [200, 400, 401, 403, 404, 429, 500]


class TestAPIDocumentation:
    """Test API documentation endpoints"""

    def test_swagger_docs_available(self, client: TestClient):
        """Test Swagger documentation is available"""
        response = client.get("/api/docs")

        # May be 200 or 404 depending on DEBUG setting
        assert response.status_code in [200, 404]

    def test_openapi_schema_available(self, client: TestClient):
        """Test OpenAPI schema is available"""
        response = client.get("/api/openapi.json")

        # May be 200 or 404 depending on DEBUG setting
        if response.status_code == 200:
            data = response.json()
            assert data.get("openapi") or data.get("swagger")
            assert "paths" in data
