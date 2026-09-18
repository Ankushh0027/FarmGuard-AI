# FarmGuard AI — Production Readiness & Architecture Specification 🚀

This document defines the production architecture, security controls, observability pipeline, deployment configuration, and operational limitations for the **FarmGuard AI** backend service.

---

## 1. System Architecture

```
                                  +---------------------------------------+
                                  |            Client Request             |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     ProductionSecurityMiddleware      |
                                  |  - Request ID Correlation (X-Req-ID)  |
                                  |  - Security Headers Injection         |
                                  |  - In-Memory Sliding Rate Limiter     |
                                  |  - Request Body Size Guard (413)      |
                                  |  - Prometheus Latency Tracking        |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     API Key Authentication Layer      |
                                  |  - Constant-time secret comparison    |
                                  |  - Configurable via API_AUTH_ENABLED  |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       Pydantic Schema Validation      |
                                  |  - Strict Agronomic Bounds Check      |
                                  |  - Safe 422 Error Transformation      |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |        AI Input Guardrails            |
                                  |  - Prompt Injection Defense           |
                                  |  - Secret / Credential Scraping Block |
                                  |  - Boundary & Relevance Filtering     |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |        FarmGuard Agent Core           |
                                  +---------------------------------------+
                                    /                 |                 \
                                   /                  |                  \
                                  v                   v                   v
              +-----------------------+  +-----------------------+  +-----------------------+
              |   Tool Authorization  |  |  Tool Input Validator |  | Tool Output Validator |
              +-----------------------+  +-----------------------+  +-----------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       Deterministic Farm Tools        |
                                  |  - Open-Meteo Weather Service         |
                                  |  - Crop Water Requirements (Kc)       |
                                  |  - Irrigation Deficit Model           |
                                  |  - Water Conservation Calculations    |
                                  |  - Stubble / Residue Estimator        |
                                  |  - Environmental Impact Calculator    |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |         LLM Synthesis Layer           |
                                  |  - Gemini API (Live Synthesis)        |
                                  |  - Deterministic Fallback Engine      |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       AI Output Guardrails            |
                                  |  - Numerical Grounding Verification   |
                                  |  - Secret Leak Redaction              |
                                  |  - Hallucination / Drift Prevention   |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |        Sanitized API Response         |
                                  +---------------------------------------+
```

---

## 2. API Security Controls

FarmGuard AI implements multi-tiered defense-in-depth across the network, application, and AI layers:

### A. Authentication & Access Control
- **Constant-Time Verification**: API keys are validated using Python's `secrets.compare_digest` to prevent side-channel timing attacks.
- **Header Support**: Accepts keys via `X-API-Key: <key>` or `Authorization: Bearer <key>`.
- **Environment Toggle**: Configured via `API_AUTH_ENABLED` and `API_KEYS`. When disabled (default for local development and offline test suites), requests pass transparently as `anonymous_dev`.

### B. Rate Limiting & DoS Protection
- **Sliding-Window Limiter**: Implemented in `app.api.middleware.InMemoryRateLimiter`, enforcing a configurable threshold (default `RATE_LIMIT_PER_MINUTE=60`).
- **HTTP 429 Standard**: Returns `429 Too Many Requests` with a compliant `Retry-After: <seconds>` header.
- **Probe Exemptions**: Liveness (`/health`), Readiness (`/ready`), and Metrics (`/metrics`) endpoints are exempted from strict rate limits to prevent orchestrator check failures.

### C. Request Payload Bounds
- **Body Size Limiter**: Enforces `MAX_CONTENT_LENGTH` (default 1MB) prior to JSON parsing, immediately terminating oversized payloads with `413 Payload Too Large`.

### D. Security Headers
All outgoing HTTP responses include hardened security headers:
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `X-Frame-Options: DENY`: Mitigates clickjacking attacks.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer leakage.
- `X-XSS-Protection: 1; mode=block`: Enables browser XSS filters.
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none';`: Restricts unauthorized framing and script injection.

### E. Safe Error Handling
- Global exception handlers catch `StarletteHTTPException`, `RequestValidationError`, and generic `Exception`.
- Internal stack traces, raw server paths (e.g. `C:\Users\...` or `/home/...`), and database/service internals are stripped in production.
- Every error response returns a consistent envelope containing `error`, `message`, `status_code`, and the correlation `request_id`.

---

## 3. Observability & Telemetry

### A. Request Correlation Tracing (`X-Request-ID`)
- Every incoming request is checked for an existing valid `X-Request-ID` or `X-Correlation-ID` header matching `^[a-zA-Z0-9_\-]{1,64}$`.
- If missing or invalid, an ID is generated (`fg-<12-hex-chars>`).
- The ID is stored in request state, attached to response headers, and included in structured logs and error payloads.

### B. Structured JSON Logging
- Security events, tool calls, guardrail triggers, and fallbacks emit structured JSON lines to standard output.
- All log fields pass through `redact_secrets()` to ensure zero credential or sensitive token leakage.

### C. Application Metrics (`GET /metrics`)
Exposes a Prometheus-compatible metrics endpoint tracking key operational signals:

| Metric Name | Type | Description |
| :--- | :--- | :--- |
| `farmguard_http_requests_total` | Counter | Total HTTP requests by method, endpoint, status |
| `farmguard_http_request_duration_seconds_total` | Counter | Total request duration in seconds |
| `farmguard_http_request_duration_seconds_count` | Counter | Request count for latency calculation |
| `farmguard_security_blocks_total` | Counter | Guardrail blocks categorized by rule/reason |
| `farmguard_rate_limit_exceeded_total` | Counter | Total rate limit exceeded events (429) |
| `farmguard_auth_failures_total` | Counter | Total authentication failure events (401/403) |
| `farmguard_tool_invocations_total` | Counter | Deterministic farming tool execution counts |
| `farmguard_fallback_activations_total` | Counter | Deterministic fallback synthesis activations |

---

## 4. Health & Readiness Contracts

### Liveness Probe (`GET /health`)
- **Purpose**: Verifies that the FastAPI process is responsive and receiving traffic.
- **Performance**: Instantaneous (~1ms), non-blocking, does **not** call Gemini, external databases, or third-party APIs.
- **Status Code**: `200 OK`
- **Response**:
  ```json
  {
    "status": "ok",
    "liveness": "healthy",
    "service": "FarmGuard AI Backend",
    "version": "0.1.0",
    "phase": "Phase 7 - Productionization & Deployment"
  }
  ```

### Readiness Probe (`GET /ready`)
- **Purpose**: Validates local application readiness (engine initialized, guardrails loaded, configuration verified).
- **Behavior**: Ensures critical local dependencies are ready without triggering expensive external LLM calls.
- **Status Code**: `200 OK` (or `503 Service Unavailable` if unready).
- **Response**:
  ```json
  {
    "status": "ready",
    "service": "FarmGuard AI Backend",
    "checks": {
      "engine": "ok",
      "guardrails": "ok",
      "config": "ok"
    }
  }
  ```

---

## 5. Deployment Configuration

### Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | String | `development` | Environment name (`development`, `test`, `staging`, `production`) |
| `DEBUG` | Boolean | `false` | Debug mode (must be `false` in production) |
| `HOST` | String | `0.0.0.0` | Bind host address |
| `PORT` | Integer | `8000` | Bind listening port |
| `ALLOWED_ORIGINS` | String | `http://localhost:3000` | Comma-separated CORS allowed origins |
| `API_AUTH_ENABLED` | Boolean | `false` | Enable API Key verification |
| `API_KEYS` | String | `""` | Comma-separated valid API keys |
| `RATE_LIMIT_PER_MINUTE` | Integer | `60` | Maximum requests per minute per client |
| `MAX_CONTENT_LENGTH` | Integer | `1048576` | Maximum request payload size in bytes (1MB) |
| `LOG_LEVEL` | String | `INFO` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `GEMINI_API_KEY` | String | `""` | Google Gemini API key for live LLM synthesis |
| `OPENMETEO_BASE_URL` | String | `https://api.open-meteo.com/v1/forecast` | Weather API endpoint |

### Docker Deployment

The backend is packaged using a multi-stage `python:3.12-slim` container running under an unprivileged system user (`appuser`, UID 10001):

```bash
# Build Docker image
docker build -t farmguard-backend:latest -f backend/Dockerfile backend/

# Run container
docker run -d -p 8000:8000 \
  -e APP_ENV=production \
  -e GEMINI_API_KEY="your_api_key" \
  --name farmguard-api \
  farmguard-backend:latest
```

Using Docker Compose:
```bash
docker-compose up -d
```

---

## 6. Known Limitations & Operational Considerations

To maintain engineering transparency, the following architectural boundaries and limitations are documented:

1. **In-Memory Rate Limiting**: The built-in rate limiter stores state in process memory. In a multi-worker or multi-container horizontally scaled deployment behind a round-robin load balancer, each worker tracks limits independently. For clustered deployments, an external shared store (such as Redis) should be introduced.
2. **External Weather Service Dependency**: While FarmGuard gracefully falls back to regional defaults upon weather API timeouts or network outages, precise real-time precipitation forecast depth depends on the external Open-Meteo endpoint.
3. **Heuristic Prompt Injection Detection**: The security guardrail employs layered pattern matching, boundary constraints, and structural sanitization. While it successfully neutralizes tested adversarial vectors, no regex/heuristic system provides an unconditional guarantee against novel semantic jailbreaks without defense-in-depth output grounding.
4. **Latency Profile Distinction**:
   - **Offline Deterministic Agent Latency**: ~0.2ms – 2ms (calculation tools + fallback synthesis).
   - **Live API End-to-End Latency**: ~800ms – 2500ms (dominated by external Gemini LLM network round-trip and synthesis).
