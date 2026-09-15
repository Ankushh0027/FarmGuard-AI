# FarmGuard AI 🌾
> India-specific AI-Powered Sustainable Farming Assistant  
> **Hackathon**: NextStep Hacks 2026 | **Theme**: Earth Forward

---

## 🎯 Project Overview
FarmGuard AI empowers Indian farmers with:
1. **Irrigation Optimization**: Precision water guidance saving millions of liters of groundwater.
2. **Crop-Residue Management**: Practical stubble management alternatives to prevent air pollution and stubble burning while replenishing soil organic carbon.
3. **Deterministic Agricultural Calculation Engine**: Clean agronomic calculations for water, fuel/electricity savings, and carbon footprint reduction without relying on LLM math hallucination.

---

## 🚀 Getting Started (Phase 1 Backend)

### Prerequisites
- Python 3.10+
- FastAPI & Uvicorn

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Running the API Server
```bash
uvicorn main:app --reload --port 8000
```

Interactive API documentation will be available at `http://localhost:8000/docs`.

### Running Tests
```bash
cd backend
pytest tests/ -v
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

### 2. Analyze Farm Plot
`POST /api/v1/farm/analyze`

**Request Body Example (Demo Scenario: 2-Acre Wheat Farm in Uttar Pradesh):**
```json
{
  "crop": "wheat",
  "area_acres": 2.0,
  "soil_type": "alluvial",
  "current_irrigation_mm": 50.0,
  "location": "Uttar Pradesh",
  "rainfall_probability": 0.15,
  "soil_moisture_percent": 45.0
}
```

---

## 📊 Core Calculation Assumptions
- **Metric Conversion**: 1 acre-mm = 4,046.86 Liters of water.
- **Tubewell Pump Rate**: ~28,000 Liters/hr (5 HP pump standard).
- **Supported Initial Crops**: Wheat, Rice (Paddy), Maize, Sugarcane.
- **Supported Soil Types**: Alluvial, Loamy, Clayey, Sandy, Black, Red.
- **Emissions Factors**: ~1,460 kg CO₂e and ~7.5 kg PM2.5 avoided per tonne of wheat residue managed sustainably instead of burned.
