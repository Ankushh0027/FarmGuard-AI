"""Shared pytest fixtures and test configurations for FarmGuard AI Backend."""

import pytest
from app.services.weather_service import clear_weather_cache


@pytest.fixture(autouse=True)
def reset_weather_cache():
    """Ensure in-memory weather cache is isolated between tests."""
    clear_weather_cache()
    yield
    clear_weather_cache()
