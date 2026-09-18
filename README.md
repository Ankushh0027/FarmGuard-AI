# FarmGuard AI 🌾
> India-specific AI-Powered Sustainable Farming Assistant  
> **Hackathon**: NextStep Hacks 2026 | **Theme**: Earth Forward

---

## 🎯 Project Overview
FarmGuard AI empowers Indian farmers with:
1. **Irrigation Optimization**: Precision water guidance saving millions of liters of groundwater by decoupling rainfall probability from precipitation depth.
2. **Crop-Residue Management**: Practical stubble management alternatives to prevent air pollution and open stubble burning while replenishing soil organic carbon.
3. **Deterministic Agricultural Calculation Engine**: Pure Python agronomic engine for water, fuel/electricity savings, and carbon footprint reduction without relying on LLM math.
4. **Defense-in-Depth AI Security & Guardrails**: Multi-tier input parameter validation, prompt injection defense, secret leak protection, tool authorization, and numerical grounding.
5. **Deterministic LLM Evaluation**: Automated 8-dimension evaluation framework verifying consistency, tool groundedness, and agricultural safety across a 32-case regression dataset.
6. **Production-Grade Microservice Architecture**: Sliding-window rate limiting, constant-time API key auth, `X-Request-ID` correlation tracing, HTTP security headers, Prometheus metrics, and containerized deployment.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- FastAPI, Uvicorn & Google GenAI SDK
- Docker & Docker Compose (optional for containerized deployment)

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
Key configuration parameters:
- `APP_ENV`: `development` | `production` | `test` (defaults to `development`)
- `API_AUTH_ENABLED`: `true` | `false` (when enabled, requires `X-API-Key` or `Authorization: Bearer <key>`)
- `API_KEYS`: Comma-separated list of valid API keys
- `RATE_LIMIT_PER_MINUTE`: Maximum requests per client IP / key per minute (default `60`)
- `GEMINI_API_KEY`: Google Gemini API key for live LLM synthesis (offline fallback activates if unset)

### Running the API Server Locally
```bash
cd backend
uvicorn main:app --reload --port 8000
```
Interactive API documentation is available at `http://localhost:8000/docs` in development mode.

### Running via Docker
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build standalone Docker image
docker build -t farmguard-backend:latest -f backend/Dockerfile backend/
docker run -d -p 8000:8000 --name farmguard farmguard-backend:latest
```

---

## 📡 API Endpoints & Health Probes

### 1. Liveness Probe
`GET /health`
Fast, non-blocking liveness check. Never calls external LLMs or third-party APIs.
```json
{
  "status": "ok",
  "liveness": "healthy",
  "service": "FarmGuard AI Backend",
  "version": "0.1.0",
  "phase": "Phase 7 - Productionization & Deployment"
}
```

### 2. Readiness Probe
`GET /ready`
Validates internal calculation engine, configuration, and security guardrails.
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

### 3. Application Metrics
`GET /metrics`
Exposes Prometheus-compatible operational telemetry:
- `farmguard_http_requests_total{method, endpoint, status}`
- `farmguard_http_request_duration_seconds_total{method, endpoint}`
- `farmguard_security_blocks_total{guardrail, reason}`
- `farmguard_rate_limit_exceeded_total`
- `farmguard_auth_failures_total`
- `farmguard_tool_invocations_total{tool}`
- `farmguard_fallback_activations_total{reason}`

### 4. Direct Deterministic Analysis
`POST /api/v1/farm/analyze`

**Request Body:**
```json
{
  "crop": "wheat",
  "area_acres": 2.0,
  "soil_type": "sandy loam",
  "current_irrigation_mm": 30.0,
  "location": "Uttar Pradesh",
  "rainfall_probability": 70,
  "forecast_rainfall_mm": 6.4,
  "soil_moisture_percent": 64.0
}
```

### 5. AI Agent Advisory, Guardrails & LLM Evaluation
`POST /api/v1/agent/advice`

**Request Body:**
```json
{
  "message": "I have a 2-acre wheat farm in Uttar Pradesh.",
  "farm": {
    "crop": "wheat",
    "area_acres": 2,
    "soil_type": "sandy loam",
    "current_irrigation_mm": 30,
    "location": "Uttar Pradesh",
    "soil_moisture_percent": 64
  }
}
```

**Response Structure:**
- `answer`: Synthesized advisory (RECOMMENDATION, WEATHER CONTEXT, WATER IMPACT, CROP RESIDUE, ENVIRONMENTAL IMPACT, WHY, ASSUMPTIONS)
- `recommendation`: Tactical irrigation action & status
- `tool_trace`: Execution log with security checkpoints (`INPUT_VALIDATED`, `WEATHER_FETCHED`, `TOOL_OUTPUT_VALIDATED`, `OUTPUT_GUARDRAIL_PASSED`, `EVALUATION_COMPLETED`)
- `numerical_results`: Verified pure mathematical tool results
- `assumptions`: Explicit categorized assumptions (`weather`, `agronomic_model`, `environmental_impact`)
- `security`: Checkpoint statuses (`input_guardrails`, `prompt_injection`, `secret_scan`, `output_guardrails`)
- `evaluation`: Deterministic LLM evaluation summary (`numerical_consistency`, `tool_groundedness`, `safety`, `uncertainty_handling`)

---

## 🛡️ AI Security & Evaluation Benchmark

FarmGuard AI includes an extensive automated security and behavioral benchmark suite:

### 1. Pytest Test Suite
```bash
cd backend
pytest -v
```

### 2. Adversarial Security Benchmark (107 cases)
```bash
cd backend
python -m app.evaluation.adversarial_evaluator
```
- Covers direct prompt injection, obfuscated encoding, multilingual injection (Hinglish/Hindi/etc.), secret extraction, tool abuse, and benign controls.
- Red-team tool resistance: 100%
- False positive rate: 0.0%
- Secret leakage rate: 0.0%

### 3. Agent Behavioral & Latency Benchmark (52 cases)
```bash
cd backend
python -m app.evaluation.agent_evaluator
```
- Tool Selection Accuracy: 100%
- Tool Sequence Correctness: 100%
- Numerical Grounding Faithfulness: 97.50%
- Semantic Relevance Rate: 94.23%
- Trace Integrity Rate: 100%

---

## 📊 Core Calculation Assumptions
- **Metric Conversion**: 1 acre-mm = 4,046.86 Liters of water.
- **Tubewell Pump Rate**: ~28,000 Liters/hr (5 HP pump prototype standard).
- **Supported Crops**: Wheat, Rice (Paddy), Maize, Sugarcane.
- **Supported Soil Types**: Alluvial, Loamy, Sandy Loam, Clayey, Clay Loam, Sandy, Black, Red.
- **Emissions Factors**: ~1,460 kg CO₂e and ~7.5 kg PM2.5 avoided per tonne of wheat residue managed sustainably instead of burned.

---

## ⚠️ Known Limitations
- **In-Memory Rate Limiting**: The rate limiter tracks requests per ASGI process. In a distributed multi-node cluster, a central cache like Redis should be configured.
- **External Weather Service**: Real-time precipitation forecasts depend on Open-Meteo availability (with automatic fallback to regional norms).
- **Heuristic Injection Defense**: While effective across tested vectors, multi-tier output grounding remains the ultimate safety invariant.
