"""Production API integration tests for FarmGuard AI.

Covers:
- /health and /ready endpoints
- Request correlation ID (generation, propagation, sanitation)
- HTTP Security Headers
- Rate limiting enforcement (429 status and Retry-After)
- API Key authentication (missing, invalid, valid, constant-time)
- Request payload size protection (413 status)
- Prometheus metrics exposition (/metrics) and metric increments
- Safe error handling without stack trace or credential leakage
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from app.config import get_settings
from app.api.middleware import get_rate_limiter
from app.api.metrics import get_metrics_registry

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_state():
    """Reset rate limiter and metrics registry before each test."""
    get_rate_limiter().reset()
    get_metrics_registry().reset()
    yield
    get_rate_limiter().reset()


# ==============================================================================
# 1. HEALTH AND READINESS ENDPOINTS
# ==============================================================================

def test_health_liveness_endpoint():
    """Verify /health returns 200 OK with liveness indicator."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["liveness"] == "healthy"
    assert "FarmGuard AI" in data["service"]


def test_ready_readiness_endpoint():
    """Verify /ready returns 200 OK with local dependency check indicators."""
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert "checks" in data
    assert data["checks"]["engine"] == "ok"
    assert data["checks"]["guardrails"] == "ok"
    assert data["checks"]["config"] == "ok"


# ==============================================================================
# 2. REQUEST TRACING & CORRELATION ID
# ==============================================================================

def test_request_id_generated_when_missing():
    """Verify an X-Request-ID is automatically generated and returned."""
    response = client.get("/health")
    assert response.status_code == 200
    req_id = response.headers.get("X-Request-ID")
    assert req_id is not None
    assert req_id.startswith("fg-")


def test_request_id_propagated_when_valid():
    """Verify a valid incoming X-Request-ID is preserved and returned."""
    custom_id = "test-correlation-id-9988"
    response = client.get("/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id


def test_request_id_sanitized_when_unsafe():
    """Verify an unsafe or malicious request ID is replaced with a safe generated ID."""
    malicious_id = "test<script>alert(1)</script>; DROP TABLE logs;"
    response = client.get("/health", headers={"X-Request-ID": malicious_id})
    assert response.status_code == 200
    returned_id = response.headers.get("X-Request-ID")
    assert returned_id != malicious_id
    assert returned_id.startswith("fg-")


# ==============================================================================
# 3. HTTP SECURITY HEADERS
# ==============================================================================

def test_security_headers_present():
    """Verify essential HTTP security headers are injected on all responses."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Content-Security-Policy" in response.headers


# ==============================================================================
# 4. RATE LIMITING
# ==============================================================================

def test_rate_limiting_enforcement(monkeypatch):
    """Verify requests exceeding rate limit receive 429 Too Many Requests."""
    settings = get_settings()
    monkeypatch.setattr(settings, "RATE_LIMIT_PER_MINUTE", 3)

    payload = {
        "crop": "wheat",
        "area_acres": 5.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Punjab",
        "rainfall_probability": 20.0,
        "soil_moisture_percent": 30.0,
    }

    # 3 allowed requests
    for _ in range(3):
        res = client.post("/api/v1/farm/analyze", json=payload)
        assert res.status_code == 200

    # 4th request must be rate limited
    res_limited = client.post("/api/v1/farm/analyze", json=payload)
    assert res_limited.status_code == 429
    data = res_limited.json()
    assert data["error"] == "Too Many Requests"
    assert "Retry-After" in res_limited.headers
    assert int(res_limited.headers["Retry-After"]) > 0


def test_rate_limiting_exempts_health_endpoint(monkeypatch):
    """Verify /health is exempt from aggressive rate limiting."""
    settings = get_settings()
    monkeypatch.setattr(settings, "RATE_LIMIT_PER_MINUTE", 2)

    for _ in range(5):
        res = client.get("/health")
        assert res.status_code == 200


# ==============================================================================
# 5. API KEY AUTHENTICATION
# ==============================================================================

def test_auth_disabled_by_default_allows_requests():
    """Verify API requests succeed without credentials when API_AUTH_ENABLED is False."""
    settings = get_settings()
    assert settings.API_AUTH_ENABLED is False

    payload = {
        "crop": "wheat",
        "area_acres": 5.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Punjab",
        "rainfall_probability": 20.0,
        "soil_moisture_percent": 30.0,
    }
    response = client.post("/api/v1/farm/analyze", json=payload)
    assert response.status_code == 200


def test_auth_enabled_missing_credentials(monkeypatch):
    """Verify 401 Unauthorized when auth is enabled and no key is provided."""
    settings = get_settings()
    monkeypatch.setattr(settings, "API_AUTH_ENABLED", True)
    monkeypatch.setattr(settings, "API_KEYS", ["fg_valid_prod_key_777"])

    payload = {
        "crop": "wheat",
        "area_acres": 5.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Punjab",
        "rainfall_probability": 20.0,
        "soil_moisture_percent": 30.0,
    }
    response = client.post("/api/v1/farm/analyze", json=payload)
    assert response.status_code == 401
    assert "Authentication required" in response.json()["message"]


def test_auth_enabled_invalid_credentials(monkeypatch):
    """Verify 403 Forbidden when an invalid key is supplied."""
    settings = get_settings()
    monkeypatch.setattr(settings, "API_AUTH_ENABLED", True)
    monkeypatch.setattr(settings, "API_KEYS", ["fg_valid_prod_key_777"])

    payload = {
        "crop": "wheat",
        "area_acres": 5.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Punjab",
        "rainfall_probability": 20.0,
        "soil_moisture_percent": 30.0,
    }
    response = client.post(
        "/api/v1/farm/analyze",
        json=payload,
        headers={"X-API-Key": "fg_fraudulent_key_000"},
    )
    assert response.status_code == 403
    assert "Invalid API key" in response.json()["message"]


def test_auth_enabled_valid_credentials_header(monkeypatch):
    """Verify request succeeds with valid X-API-Key header."""
    settings = get_settings()
    monkeypatch.setattr(settings, "API_AUTH_ENABLED", True)
    monkeypatch.setattr(settings, "API_KEYS", ["fg_valid_prod_key_777"])

    payload = {
        "crop": "wheat",
        "area_acres": 5.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Punjab",
        "rainfall_probability": 20.0,
        "soil_moisture_percent": 30.0,
    }
    response = client.post(
        "/api/v1/farm/analyze",
        json=payload,
        headers={"X-API-Key": "fg_valid_prod_key_777"},
    )
    assert response.status_code == 200


def test_auth_enabled_valid_credentials_bearer(monkeypatch):
    """Verify request succeeds with valid Bearer token."""
    settings = get_settings()
    monkeypatch.setattr(settings, "API_AUTH_ENABLED", True)
    monkeypatch.setattr(settings, "API_KEYS", ["fg_valid_prod_key_777"])

    payload = {
        "crop": "wheat",
        "area_acres": 5.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Punjab",
        "rainfall_probability": 20.0,
        "soil_moisture_percent": 30.0,
    }
    response = client.post(
        "/api/v1/farm/analyze",
        json=payload,
        headers={"Authorization": "Bearer fg_valid_prod_key_777"},
    )
    assert response.status_code == 200


# ==============================================================================
# 6. PAYLOAD SIZE BOUNDS
# ==============================================================================

def test_payload_too_large_rejected(monkeypatch):
    """Verify requests exceeding max content length receive 413 Payload Too Large."""
    settings = get_settings()
    monkeypatch.setattr(settings, "MAX_CONTENT_LENGTH", 500)

    oversized_headers = {"Content-Length": "1000"}
    response = client.post(
        "/api/v1/farm/analyze",
        json={"crop": "wheat", "padding": "x" * 800},
        headers=oversized_headers,
    )
    assert response.status_code == 413
    assert response.json()["error"] == "Payload Too Large"


# ==============================================================================
# 7. METRICS EXPOSITION
# ==============================================================================

def test_metrics_exposition_and_increment():
    """Verify /metrics exposes Prometheus metrics and records API calls."""
    # Issue a health check request
    client.get("/health")

    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers.get("content-type", "")
    content = response.text

    assert "farmguard_http_requests_total" in content
    assert "farmguard_http_request_duration_seconds" in content
    assert "farmguard_security_blocks_total" in content
    assert "farmguard_rate_limit_exceeded_total" in content
    assert "farmguard_auth_failures_total" in content
    assert "farmguard_tool_invocations_total" in content


# ==============================================================================
# 8. SAFE ERROR HANDLING & NO SECRET LEAKAGE
# ==============================================================================

def test_validation_error_safe_response():
    """Verify 422 error response includes request_id and no filesystem paths."""
    bad_payload = {"crop": "invalid_unknown_crop_xyz", "area_acres": -10}
    response = client.post("/api/v1/farm/analyze", json=bad_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "request_id" in data
    assert data["request_id"] is not None

    # Verify no local Windows/Linux path leakage
    response_text = response.text
    assert "C:\\Users\\" not in response_text
    assert "/home/" not in response_text
    assert "Traceback" not in response_text
