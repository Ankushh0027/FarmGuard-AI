# FarmGuard AI 🌾
> India-specific AI-Powered Sustainable Farming Assistant  
> **Hackathon**: NextStep Hacks 2026 | **Theme**: Earth Forward

---

## 🎯 Project Overview
FarmGuard AI empowers Indian farmers with:
1. **Irrigation Optimization**: Precision water guidance saving millions of liters of groundwater.
2. **Crop-Residue Management**: Practical stubble management alternatives to prevent air pollution and stubble burning while replenishing soil organic carbon.
3. **Deterministic Agricultural Calculation Engine**: Clean agronomic calculations for water, fuel/electricity savings, and carbon footprint reduction without relying on LLM math hallucination.
4. **Gemini Agent & Tool Orchestration**: AI agent that orchestrates deterministic tools and synthesizes empathetic, actionable, and transparent farming advisory.

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
*(If unset, the agent automatically executes deterministic tool orchestration and generates structured synthesis offline)*

### Running the API Server
```bash
cd backend
uvicorn main:app --reload --port 8000
```
Interactive API documentation is available at `http://localhost:8000/docs`.

### Running Tests
```bash
cd backend
pytest -q
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
  "soil_moisture_percent": 64.0
}
```

### 3. AI Agent Advisory & Tool Orchestration
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
    "rainfall_probability": 70,
    "soil_moisture_percent": 64
  }
}
```

**Response includes:**
- `answer`: Synthesized advisory with sections (RECOMMENDATION, WATER IMPACT, CROP RESIDUE, ENVIRONMENTAL IMPACT, WHY, ASSUMPTIONS)
- `recommendation`: Tactical irrigation action & status
- `tool_trace`: Execution log of deterministic tool calls
- `numerical_results`: Verified pure mathematical results
- `assumptions`: Explicit model and weather assumptions

---

## 📊 Core Calculation Assumptions
- **Metric Conversion**: 1 acre-mm = 4,046.86 Liters of water.
- **Tubewell Pump Rate**: ~28,000 Liters/hr (5 HP pump standard).
- **Supported Crops**: Wheat, Rice (Paddy), Maize, Sugarcane.
- **Supported Soil Types**: Alluvial, Loamy, Sandy Loam, Clayey, Clay Loam, Sandy, Black, Red.
- **Emissions Factors**: ~1,460 kg CO₂e and ~7.5 kg PM2.5 avoided per tonne of wheat residue managed sustainably instead of burned.
