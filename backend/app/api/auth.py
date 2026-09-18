"""Lightweight API Key Authentication Dependency for FarmGuard AI.

Uses constant-time comparison to prevent timing side-channel attacks.
Can be toggled via API_AUTH_ENABLED environment variable.
"""

import secrets
from typing import Optional
from fastapi import Header, HTTPException, status, Security
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
from app.config import get_settings
from app.api.metrics import get_metrics_registry
from app.observability.logger import log_security_event

api_key_header_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)
bearer_scheme = HTTPBearer(auto_error=False)


async def verify_api_key(
    x_api_key: Optional[str] = Security(api_key_header_scheme),
    bearer_auth: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> Optional[str]:
    """Verify incoming request API Key using constant-time digest comparison.

    Accepts key via 'X-API-Key' header or 'Authorization: Bearer <key>'.
    Bypasses check if API_AUTH_ENABLED is False (development/testing default).
    """
    settings = get_settings()

    if not settings.API_AUTH_ENABLED:
        return "anonymous_dev"

    token: Optional[str] = None
    if x_api_key:
        token = x_api_key.strip()
    elif bearer_auth and bearer_auth.credentials:
        token = bearer_auth.credentials.strip()

    metrics = get_metrics_registry()

    if not token:
        metrics.record_auth_failure()
        log_security_event(
            event_type="API_AUTH",
            guardrail="api_authentication",
            result="blocked",
            reason="Missing API key or authorization credentials.",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Provide a valid API key via X-API-Key or Bearer token.",
            headers={"WWW-Authenticate": "Bearer, ApiKey"},
        )

    # Constant-time comparison against configured API keys
    for valid_key in settings.API_KEYS:
        if secrets.compare_digest(token, valid_key):
            return "authenticated_client"

    metrics.record_auth_failure()
    log_security_event(
        event_type="API_AUTH",
        guardrail="api_authentication",
        result="blocked",
        reason="Invalid API key provided.",
    )
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Invalid API key.",
    )
