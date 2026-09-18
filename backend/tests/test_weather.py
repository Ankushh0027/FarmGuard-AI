"""Tests for live Open-Meteo weather service and weather tool."""

import pytest
import httpx
from unittest.mock import patch, MagicMock

from app.services.weather_service import (
    fetch_weather_forecast,
    resolve_coordinates,
)
from app.tools.farm_tools import get_weather_forecast


def test_weather_service_known_location_resolution():
    """Test resolution of standard Indian locations."""
    coords_up = resolve_coordinates("Uttar Pradesh")
    assert coords_up is not None
    assert coords_up[0] == pytest.approx(26.8467, abs=0.01)

    coords_punjab = resolve_coordinates("Punjab")
    assert coords_punjab is not None
    assert coords_punjab[0] == pytest.approx(30.9010, abs=0.01)


def test_weather_service_successful_api_call_mock():
    """Test successful weather fetch with mocked Open-Meteo response."""
    mock_payload = {
        "daily": {
            "time": ["2026-09-15"],
            "precipitation_sum": [12.4],
            "precipitation_probability_max": [80.0]
        }
    }
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_payload
        mock_get.return_value = mock_resp

        res = fetch_weather_forecast("Uttar Pradesh")
        assert res["status"] == "available"
        assert res["forecast_rainfall_mm"] == 12.4
        assert res["rainfall_probability"] == 0.8
        assert res["source"] == "Open-Meteo"


def test_weather_tool_successful_call():
    """Test get_weather_forecast tool wrapper."""
    mock_payload = {
        "daily": {
            "time": ["2026-09-15"],
            "precipitation_sum": [0.0],
            "precipitation_probability_max": [10.0]
        }
    }
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_payload
        mock_get.return_value = mock_resp

        res = get_weather_forecast("Haryana")
        assert res["status"] == "available"
        assert res["forecast_rainfall_mm"] == 0.0
        assert res["rainfall_probability"] == 0.10


def test_weather_service_timeout_handling():
    """Test graceful handling when weather API times out."""
    with patch("httpx.Client.get", side_effect=httpx.TimeoutException("Connection timed out")):
        res = fetch_weather_forecast("Uttar Pradesh")
        assert res["status"] == "unavailable"
        assert res["forecast_rainfall_mm"] is None
        assert "timed out" in res["message"].lower()


def test_weather_service_http_error_handling():
    """Test graceful handling when weather API returns 500 error."""
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_get.return_value = mock_resp

        res = fetch_weather_forecast("Punjab")
        assert res["status"] == "unavailable"
        assert res["forecast_rainfall_mm"] is None


def test_weather_service_malformed_response_handling():
    """Test graceful handling when weather API returns malformed JSON."""
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"invalid": "structure"}
        mock_get.return_value = mock_resp

        res = fetch_weather_forecast("Bihar")
        assert res["status"] == "available"
        # Falls back to 0.0 rather than crashing
        assert res["forecast_rainfall_mm"] == 0.0


def test_weather_service_unknown_location_geocoding_failure():
    """Test unknown location when geocoding fails."""
    with patch("httpx.Client.get", side_effect=Exception("Geocoding failed")):
        res = fetch_weather_forecast("UnknownFictionalState999")
        assert res["status"] == "unavailable"
        assert res["forecast_rainfall_mm"] is None
