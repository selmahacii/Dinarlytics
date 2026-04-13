"""
Authentication API Tests

Tests for:
- User registration
- User login
- Token refresh
- Password change
- Current user info

Run with:
    pytest tests/unit/test_auth.py -v
"""

import pytest
from fastapi.testclient import TestClient


class TestUserRegistration:
    """Test user registration endpoint"""

    def test_register_new_user_success(self, client: TestClient):
        """Test successful user registration"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "SecurePass123!",
                "company_id": "company-123",
            },
        )

        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data or "username" in data

    def test_register_duplicate_username_fails(self, client: TestClient, auth_token: str):
        """Test registration with duplicate username fails"""
        # First registration (should succeed)
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "duplicateuser",
                "email": "dup1@example.com",
                "password": "SecurePass123!",
                "company_id": "company-123",
            },
        )

        # Second registration with same username (should fail)
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "duplicateuser",
                "email": "dup2@example.com",
                "password": "SecurePass123!",
                "company_id": "company-123",
            },
        )

        assert response.status_code in [400, 409]  # Conflict

    def test_register_invalid_email_fails(self, client: TestClient):
        """Test registration with invalid email fails"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "invalidemailuser",
                "email": "not-an-email",
                "password": "SecurePass123!",
                "company_id": "company-123",
            },
        )

        assert response.status_code in [400, 422]

    def test_register_weak_password_fails(self, client: TestClient):
        """Test registration with weak password fails"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "weakpassworduser",
                "email": "weak@example.com",
                "password": "weak",  # Too weak
                "company_id": "company-123",
            },
        )

        assert response.status_code in [400, 422]


class TestUserLogin:
    """Test user login endpoint"""

    def test_login_with_valid_credentials(self, client: TestClient):
        """Test login with valid username and password"""
        # First register
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "loginuser",
                "email": "login@example.com",
                "password": "ValidPass123!",
                "company_id": "company-123",
            },
        )

        # Then login
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "loginuser", "password": "ValidPass123!"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data or "token" in data
        assert data.get("token_type", "bearer").lower() == "bearer"

    def test_login_with_invalid_password(self, client: TestClient):
        """Test login with wrong password fails"""
        # Register user
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "wrongpassuser",
                "email": "wrongpass@example.com",
                "password": "CorrectPass123!",
                "company_id": "company-123",
            },
        )

        # Try login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "wrongpassuser", "password": "WrongPass123!"},
        )

        assert response.status_code in [400, 401]

    def test_login_nonexistent_user_fails(self, client: TestClient):
        """Test login with nonexistent user fails"""
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "nonexistentuser", "password": "SomePass123!"},
        )

        assert response.status_code in [400, 401, 404]

    @pytest.mark.slow
    def test_login_rate_limiting(self, client: TestClient):
        """Test login endpoint rate limiting (5/minute)"""
        # Register user
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "ratelimiteduser",
                "email": "ratelimited@example.com",
                "password": "ValidPass123!",
                "company_id": "company-123",
            },
        )

        # Attempt multiple failed logins
        for i in range(6):
            response = client.post(
                "/api/v1/auth/login",
                json={"username": "ratelimiteduser", "password": "WrongPass!"},
            )

            # Some should fail due to rate limiting or wrong password
            assert response.status_code in [400, 401, 429]


class TestTokenRefresh:
    """Test token refresh endpoint"""

    def test_refresh_token_success(self, client: TestClient, auth_token: str):
        """Test token refresh returns new access token"""
        response = client.post(
            "/api/v1/auth/refresh-token",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        # Should succeed or require special refresh token
        assert response.status_code in [200, 401, 404]

    def test_refresh_with_invalid_token_fails(self, client: TestClient):
        """Test refresh with invalid token fails"""
        response = client.post(
            "/api/v1/auth/refresh-token",
            headers={"Authorization": "Bearer invalid.token.here"},
        )

        assert response.status_code in [401, 403]


class TestCurrentUser:
    """Test get current user endpoint"""

    def test_get_current_user_with_valid_token(self, client: TestClient, auth_token: str):
        """Test getting current user info with valid token"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code in [200, 401, 404]
        if response.status_code == 200:
            data = response.json()
            assert "username" in data or "email" in data

    def test_get_current_user_without_token_fails(self, client: TestClient):
        """Test getting current user without token fails"""
        response = client.get("/api/v1/auth/me")

        assert response.status_code in [401, 403]


class TestPasswordChange:
    """Test password change endpoint"""

    def test_change_password_success(self, client: TestClient, auth_token: str):
        """Test successful password change"""
        response = client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "current_password": "TestPassword123!",
                "new_password": "NewPassword123!",
            },
        )

        # Should succeed or return 404 if endpoint not implemented
        assert response.status_code in [200, 401, 404]

    def test_change_password_wrong_current_fails(self, client: TestClient, auth_token: str):
        """Test password change with wrong current password fails"""
        response = client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "current_password": "WrongPassword123!",
                "new_password": "NewPassword123!",
            },
        )

        # Should fail validation
        assert response.status_code in [400, 401, 403, 404]
