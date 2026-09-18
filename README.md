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

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- FastAPI, Uvicorn & Google GenAI SDK

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Environment Configuration (Optional for Live Gemini API)
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```
*(If unset, the agent automatically executes deterministic tool orchestration, guardrail checks, and generates structured synthesis offline)*

### Running the API Server
```bash
cd backend
uvicorn main:app --reload --port 8000
```
Interactive API documentation is available at `http://localhost:8000/docs`.

### Running Tests
```bash
cd backend
pytest -v
```

---

## 📡 API Endpoints

### 1. Health Check
`GET /health`
```json
{
  "status": "ok",
  "service": "FarmGuard AI Backend",
  "version": "0.1.0"
}
```

### 2. Direct Deterministic Analysis
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

### 3. AI Agent Advisory, Guardrails & LLM Evaluation
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

**Response includes:**
- `answer`: Synthesized advisory (RECOMMENDATION, WEATHER CONTEXT, WATER IMPACT, CROP RESIDUE, ENVIRONMENTAL IMPACT, WHY, ASSUMPTIONS)
- `recommendation`: Tactical irrigation action & status
- `tool_trace`: Execution log with security events (`INPUT_VALIDATED`, `WEATHER_FETCHED`, `TOOL_OUTPUT_VALIDATED`, `OUTPUT_GUARDRAIL_PASSED`, `EVALUATION_COMPLETED`)
- `numerical_results`: Verified pure mathematical tool results
- `assumptions`: Explicit categorized assumptions (`weather`, `agronomic_model`, `environmental_impact`)
- `security`: Checkpoint statuses (`input_guardrails`, `prompt_injection`, `secret_scan`, `output_guardrails`)
- `evaluation`: Deterministic LLM evaluation summary (`numerical_consistency`, `tool_groundedness`, `safety`, `uncertainty_handling`)

---

## 🛡️ AI Security & Adversarial Evaluation Suite

FarmGuard AI includes a defense-in-depth security benchmark covering **107 test cases** in `backend/tests/adversarial_cases.json`:
- **Direct Prompt Injections** (DAN mode, roleplay escapes, system prompt extraction)
- **Obfuscated Attacks** (spaced characters, mixed casing, base64 payloads, delimiter manipulation)
- **Multilingual Attacks** (Hindi, Hinglish, Spanish, French, German, Arabic, Telugu)
- **Secret Extraction & Environment Variable Dumps** (`$GEMINI_API_KEY`, `os.environ`, auth tokens)
- **Tool Abuse & Parameter Attacks** (unauthorized tools, `NaN`/`Infinity` injections, bounds violations)
- **Deterministic Synthesis Fallback** (catches numerical hallucinations, unsupported certainty claims)
- **Benign Controls** (22 realistic farming queries with trigger words to ensure $0.0\%$ False Positive Rate)

### Running the Adversarial Benchmark
```bash
cd backend
python -m app.evaluation.adversarial_evaluator
```

### Running the Agent Behavioral & Latency Benchmark
```bash
cd backend
python -m app.evaluation.agent_evaluator
```

---

## 📊 Core Calculation Assumptions
- **Metric Conversion**: 1 acre-mm = 4,046.86 Liters of water.
- **Tubewell Pump Rate**: ~28,000 Liters/hr (5 HP pump prototype standard).
- **Supported Crops**: Wheat, Rice (Paddy), Maize, Sugarcane.
- **Supported Soil Types**: Alluvial, Loamy, Sandy Loam, Clayey, Clay Loam, Sandy, Black, Red.
- **Emissions Factors**: ~1,460 kg CO₂e and ~7.5 kg PM2.5 avoided per tonne of wheat residue managed sustainably instead of burned.
