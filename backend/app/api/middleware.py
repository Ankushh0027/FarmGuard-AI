"""HTTP Middleware for FarmGuard AI.

Provides:
- Request ID correlation & propagation
- Security headers injection
- In-memory sliding-window rate limiting
- Request payload size protection
- Request latency and status metrics collection
"""

import time
import re
import threading
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

from app.config import get_settings
from app.observability.logger import generate_request_id, log_security_event
from app.api.metrics import get_metrics_registry

SAFE_REQUEST_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{1,64}$")


class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter per client identifier."""

    def __init__(self):
        self._lock = threading.Lock()
        # Key: client_identifier -> List of timestamp floats
        self._clients: Dict[str, List[float]] = {}

    def is_allowed(self, client_id: str, max_requests: int, window_seconds: float = 60.0) -> Tuple[bool, int]:
        """Check if request is permitted under rate limit window.

        Returns (is_allowed, retry_after_seconds).
        """
        now = time.time()
        with self._lock:
            # Clean old entries
            timestamps = self._clients.get(client_id, [])
            valid_timestamps = [ts for ts in timestamps if now - ts < window_seconds]

            if len(valid_timestamps) >= max_requests:
                earliest = valid_timestamps[0]
                retry_after = max(1, int(window_seconds - (now - earliest)))
                self._clients[client_id] = valid_timestamps
                return False, retry_after

            valid_timestamps.append(now)
            self._clients[client_id] = valid_timestamps
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._clients.clear()


_rate_limiter = InMemoryRateLimiter()


def get_rate_limiter() -> InMemoryRateLimiter:
    return _rate_limiter


class ProductionSecurityMiddleware(BaseHTTPMiddleware):
    """Central production middleware for security, tracing, rate limiting, and metrics."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        settings = get_settings()
        metrics = get_metrics_registry()

        # 1. Request ID correlation
        raw_req_id = request.headers.get("X-Request-ID") or request.headers.get("X-Correlation-ID")
        if raw_req_id and SAFE_REQUEST_ID_REGEX.match(raw_req_id):
            request_id = raw_req_id
        else:
            request_id = generate_request_id()
        request.state.request_id = request_id

        path = request.url.path

        # 2. Request body size check
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length_int = int(content_length)
                if length_int > settings.MAX_CONTENT_LENGTH:
                    metrics.record_security_block("payload_size", "payload_too_large")
                    log_security_event(
                        event_type="PAYLOAD_SIZE",
                        guardrail="payload_size_limiter",
                        result="blocked",
                        reason=f"Content-Length {length_int} exceeds max limit {settings.MAX_CONTENT_LENGTH}",
                        request_id=request_id,
                    )
                    response = JSONResponse(
                        status_code=413,
                        content={
                            "error": "Payload Too Large",
                            "message": f"Request body exceeds limit of {settings.MAX_CONTENT_LENGTH} bytes.",
                            "request_id": request_id,
                        },
                    )
                    self._apply_security_headers(response, request_id)
                    return response
            except ValueError:
                pass

        # 3. Rate Limiting (exempt /health, /ready, /metrics, /docs, /openapi.json)
        is_exempt_route = path in ["/health", "/ready", "/metrics", "/docs", "/openapi.json", "/redoc"]
        if not is_exempt_route:
            client_ip = request.client.host if request.client else "unknown_ip"
            api_key = request.headers.get("X-API-Key")
            client_identifier = f"key:{api_key}" if api_key else f"ip:{client_ip}"

            allowed, retry_after = _rate_limiter.is_allowed(
                client_identifier,
                max_requests=settings.RATE_LIMIT_PER_MINUTE,
                window_seconds=60.0,
            )

            if not allowed:
                metrics.record_rate_limit()
                log_security_event(
                    event_type="RATE_LIMIT",
                    guardrail="in_memory_rate_limiter",
                    result="blocked",
                    reason=f"Client {client_identifier} exceeded rate limit of {settings.RATE_LIMIT_PER_MINUTE} req/min",
                    request_id=request_id,
                )
                response = JSONResponse(
                    status_code=429,
                    content={
                        "error": "Too Many Requests",
                        "message": f"Rate limit of {settings.RATE_LIMIT_PER_MINUTE} requests/minute exceeded. Please retry after {retry_after} seconds.",
                        "request_id": request_id,
                    },
                    headers={"Retry-After": str(retry_after)},
                )
                self._apply_security_headers(response, request_id)
                return response

        # 4. Dispatch to endpoint
        try:
            response = await call_next(request)
        except Exception as exc:
            # Fallback error response
            log_security_event(
                event_type="UNHANDLED_EXCEPTION",
                guardrail="middleware_exception_handler",
                result="failed",
                reason=str(exc),
                request_id=request_id,
            )
            response = JSONResponse(
                status_code=500,
                content={
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred processing your request.",
                    "request_id": request_id,
                },
            )

        duration = time.time() - start_time

        # 5. Record request metrics
        metrics.record_request(
            method=request.method,
            endpoint=self._normalize_endpoint(path),
            status_code=response.status_code,
            duration_sec=duration,
        )

        # 6. Apply Security Headers & Request-ID
        self._apply_security_headers(response, request_id)
        return response

    def _apply_security_headers(self, response: Response, request_id: str) -> None:
        """Inject robust security headers on all HTTP responses."""
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none';"

    def _normalize_endpoint(self, path: str) -> str:
        """Map high-cardinality dynamic paths to clean metric endpoint names."""
        if path.startswith("/api/v1/farm/analyze"):
            return "/api/v1/farm/analyze"
        if path.startswith("/api/v1/agent/advice"):
            return "/api/v1/agent/advice"
        return path
