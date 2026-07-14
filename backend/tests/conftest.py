"""
Pytest Configuration and Fixtures

Provides:
- Database testing setup (SQLite in-memory)
- FastAPI test client
- Authentication fixtures
- Cleanup between tests
"""

import pytest
import os
from typing import AsyncGenerator, Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Set testing mode
os.environ["TESTING"] = "true"

from app.main import app
from app.core.database import Base, get_db


# ========== DATABASE SETUP ==========
# Les modèles utilisent les types PostgreSQL (UUID, JSON) : SQLite ne peut
# PAS les compiler — l'ancienne fixture sqlite:///:memory: échouait sur
# CreateTable dès le premier test. Les tests d'intégration exigent donc un
# vrai PostgreSQL, fourni via TEST_DATABASE_URL (service container en CI,
# base docker locale en dev). Sans cette variable, les tests dépendants de
# la base sont SKIPPED — les tests purs (calculs, profils fiscaux, paie,
# UBL, plan comptable) tournent partout sans base.
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")


@pytest.fixture(scope="function")
def test_db() -> Generator:
    """PostgreSQL de test (TEST_DATABASE_URL). Skip si non configuré."""
    if not TEST_DATABASE_URL:
        pytest.skip("TEST_DATABASE_URL non défini — test d'intégration base ignoré")

    engine = create_engine(TEST_DATABASE_URL, poolclass=None)

    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield TestingSessionLocal()

    # Cleanup
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


# ========== CLIENT FIXTURES ==========
@pytest.fixture
def client(test_db) -> TestClient:
    """Create a test client for FastAPI (sync)"""
    return TestClient(app)


@pytest.fixture
def anyio_backend():
    """Configure pytest-asyncio backend"""
    return "asyncio"


@pytest.fixture
async def async_client(test_db) -> AsyncGenerator:
    """Create an async test client for FastAPI"""
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


# ========== AUTHENTICATION FIXTURES ==========
@pytest.fixture
def auth_token(client: TestClient) -> str:
    """Create a valid JWT token for testing"""
    # Register test user
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123!",
            "company_id": "test-company-001",
        },
    )

    if response.status_code not in [200, 201]:
        # May already exist from previous test
        pass

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "TestPassword123!"},
    )

    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token: str) -> dict:
    """Get authorization headers with valid JWT token"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def test_user_email() -> str:
    """Get test user email"""
    return "test@example.com"


@pytest.fixture
def test_company_id() -> str:
    """Get test company ID"""
    return "test-company-001"


# ========== TEST MARKERS & CONFIGURATION ==========
def pytest_configure(config):
    """Register custom markers"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m not slow')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "security: marks tests focused on security"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )


def pytest_collection_modifyitems(config, items):
    """Add default markers to test files"""
    for item in items:
        # Auto-mark test types
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)

