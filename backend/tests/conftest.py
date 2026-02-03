import pytest
from httpx import AsyncClient
from typing import AsyncGenerator
from app.main import app

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
async def client() -> AsyncGenerator:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
