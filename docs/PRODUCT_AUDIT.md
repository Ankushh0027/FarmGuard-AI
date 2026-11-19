# FarmGuard AI — Comprehensive Product Audit

**Audit Date:** November 2026  
**Auditor:** FarmGuard AI Core Product & Engineering  
**Application Scope:** Frontend (`frontend/`), Backend (`backend/`), Configurations, Documentation, and Third-Party Integrations.

---

## 1. Executive Summary

FarmGuard AI was initiated as an agricultural decision support system for Indian farmers, addressing precision irrigation, water conservation, groundwater depletion, and stubble residue management.

This audit evaluates the codebase to establish what is genuinely functional, what is partially implemented, what is cosmetic or simulated, what is missing, and what UI/UX barriers prevent real Indian farmers from using the product effectively.

---

## 2. Architecture & Technology Stack Overview

### Backend (`/backend`)
- **Framework:** FastAPI (Python 3.12) with Pydantic v2 data models.
- **Agronomic Engine:** Deterministic calculation module (`app/calculations/farm_calculator.py`) implementing FAO-56 Penman-Monteith derived soil-water deficit formulas.
- **AI Agent:** LangChain/Gemini-based agricultural advisory agent (`app/agents/farm_agent.py`) with deterministic tool orchestration, multi-tier guardrails (prompt injection, secret scanning, numerical grounding), and language detection.
- **Weather Service:** Open-Meteo REST integration (`app/services/weather_service.py`) with static coordinate mapping for Indian states and 15-minute in-memory caching.
- **Telemetry & Health:** Prometheus exposition (`/metrics`), liveness (`/health`), and readiness (`/ready`).

### Frontend (`/frontend`)
- **Framework:** React 18.3, Vite 5.4.
- **Icons & UI:** Lucide React icons, Leaflet 1.9 for map visualizations.
- **Styling:** Custom CSS design system in `src/index.css` (CSS variables, flexbox, CSS grid).
- **State Management:** React Context (`FarmContext.jsx`) holding a single active farm profile, analysis results, activity logs, and language state.
- **i18n:** Custom utility (`utils/i18n.js`) providing trilingual dictionaries for English, Roman Hinglish, and Devanagari Hindi.

---

## 3. Inventory of Existing Screens

The current frontend defines 12 distinct pages accessible via a 12-item navigation sidebar:

| # | Screen Name | Component | File Path | Current Status |
|---|---|---|---|---|
| 1 | **Home Dashboard** | `OverviewPage` | `src/pages/OverviewPage.jsx` | PARTIALLY WORKING |
| 2 | **Check Water Need** | `FarmAnalysisPage` | `src/pages/FarmAnalysisPage.jsx` | WORKING |
| 3 | **Ask FarmGuard** | `AIAdvisorPage` | `src/pages/AIAdvisorPage.jsx` | WORKING |
| 4 | **Should I Water Today?** | `WeatherPage` | `src/pages/WeatherPage.jsx` | WORKING |
| 5 | **Water & Money Saved** | `SavingsPage` | `src/pages/SavingsPage.jsx` | WORKING |
| 6 | **Community Crop Alerts** | `CommunityPage` | `src/pages/CommunityPage.jsx` | UI ONLY (localStorage) |
| 7 | **Mandi Prices & MSP** | `MarketPage` | `src/pages/MarketPage.jsx` | UI ONLY (simulated data) |
| 8 | **My Field Reports** | `ActivityPage` | `src/pages/ActivityPage.jsx` | PARTIALLY WORKING (session memory) |
| 9 | **Field Safety Rules** | `SecurityCenterPage` | `src/pages/SecurityCenterPage.jsx` | WORKING (interactive red-team test) |
| 10 | **Accuracy & Testing** | `EvaluationPage` | `src/pages/EvaluationPage.jsx` | UI ONLY (static benchmark tables) |
| 11 | **How It Works** | `ArchitecturePage` | `src/pages/ArchitecturePage.jsx` | UI ONLY (static documentation) |
| 12 | **About FarmGuard** | `AboutPage` | `src/pages/AboutPage.jsx` | UI ONLY (static content) |

---

## 4. Detailed Feature-by-Feature Classification

Every feature across the application is classified below into one of four states:
- **WORKING:** Fully functional, connected to real calculations or APIs, handles inputs and outputs properly.
- **PARTIALLY WORKING:** Functional in some conditions (e.g. client fallback works, or works for default farm only), but lacks persistence, full connectivity, or error resilience.
- **UI ONLY:** Visual mock or simulated dataset; no live data integration exists.
- **NOT IMPLEMENTED:** Planned or referenced in concept, but completely absent from the codebase.

---

### Feature 1: Deterministic Irrigation Calculation
- **Status:** **WORKING**
- **Backend API:** `POST /api/v1/farm/analyze`
- **Frontend Client:** `analyzeFarm()` in `src/services/api.js` + offline fallback `calculateDeterministicFallback()`
- **Supported Crops:** Wheat, Rice/Paddy, Maize, Sugarcane.
- **Supported Soils:** Alluvial, Loamy, Sandy Loam, Clayey, Clay Loam, Sandy, Black, Red.
- **Calculation Output:**
  - Net recommended irrigation depth (mm)
  - Water volume in Liters and Cubic Meters
  - Pumping duration (hours and minutes) adjusted for pump discharge (LPH / LPM)
  - Soil moisture deficit (%)
  - Rain deduction offset (mm) based on precipitation forecast
  - Stubble residue yield (tonnes) and burning risk
  - Avoided CO2e (kg) and avoided PM2.5 (kg)
- **Observations:** Both the backend FastAPI endpoint and the client-side JavaScript fallback math produce identical, verified results matching FAO-56 prototype constants.

---

### Feature 2: Conversational AI Farm Assistant
- **Status:** **WORKING**
- **Backend API:** `POST /api/v1/agent/advice`
- **Frontend Client:** `getAgentAdvice()` in `src/services/api.js`
- **Capabilities:**
  - Contextual awareness of active farm parameters (crop, soil, acres, moisture, pump flow)
  - Multilingual processing (English, Roman Hinglish, Devanagari Hindi)
  - Tool execution trace inspection (showing deterministic tools invoked)
  - Guardrail verification (prompt injection defense, physical bounds checking, secret scanning)
  - Quick-prompt action chips (e.g., "Will it rain today?", "How to make compost?", "My leaves are yellowing")
  - Offline structured fallback synthesis when LLM API key is absent
- **Observations:** Highly capable and secure. Response generation correctly respects guardrails.

---

### Feature 3: Live Weather Integration
- **Status:** **WORKING**
- **Backend API:** Handled in backend via `app/services/weather_service.py` AND in frontend directly via Open-Meteo REST API (`https://api.open-meteo.com/v1/forecast`)
- **Capabilities:**
  - Fetches 7-day precipitation sums (mm), precipitation probabilities (%), maximum/minimum temperatures (°C), and FAO-56 reference evapotranspiration (ET0)
  - Region selection across 13 major Indian states
  - Formulates tactical watering advice: "WATER NOW", "WAIT FOR RAIN", or "REDUCED WATERING"
  - Injects live forecast rainfall directly into the farm analysis state
- **Observations:** Works reliably without requiring third-party API keys.

---

### Feature 4: Water & Financial Savings Calculator
- **Status:** **WORKING**
- **Backend API:** Supported by `POST /api/v1/farm/analyze` (`water_analysis` and `environmental_impact`)
- **Frontend Component:** `SavingsPage.jsx`
- **Capabilities:**
  - Configurable tubewell pump ratings (3 HP, 5 HP, 7.5 HP, 10 HP)
  - Configurable electricity tariff (₹/kWh)
  - Computes single-irrigation and seasonal (4-cycle) water volume savings (Liters), electricity savings (kWh), monetary savings (₹), and tubewell run-time reduction (hours)
  - Compares traditional flood irrigation against precision irrigation across seasonal growth stages
- **Observations:** Scientifically grounded, highly relatable to Indian farmers.

---

### Feature 5: Multi-Farm / Field Management
- **Status:** **NOT IMPLEMENTED**
- **Current State:** The entire app assumes a single global farm in `FarmContext.jsx` (`DEFAULT_FARM`). There is no concept of managing multiple parcels of land (e.g., "North Field - 2 acres Wheat", "Well Field - 1.5 acres Mustard").
- **Impact:** Real Indian farmers frequently manage fragmented plots with different crops, sowing dates, and water sources. The inability to save, name, switch, and edit distinct fields is a major architectural gap.

---

### Feature 6: Add / Edit Farm Profile Workflow
- **Status:** **PARTIALLY WORKING**
- **Current State:** Farm parameters can only be edited inline inside the huge "Field Water Need Calculator" (`FarmAnalysisPage.jsx`). There is no dedicated, clean "Add Field" or "Edit Farm" modal or standalone screen.
- **Impact:** Conflates farm profile management with running single irrigation calculations. A farmer cannot set up their farm once and simply view daily recommendations.

---

### Feature 7: Soil Moisture Estimation Assistance
- **Status:** **WORKING**
- **Frontend Utility:** Embedded hand-feel moisture test guide (`getSoilMoistureGuide()`) and pump flow bucket test helper in `FarmAnalysisPage.jsx`
- **Capabilities:**
  - Explains the 6-inch hand ball test in plain language (Dry powder vs crumbly vs firm ball vs muddy ribbon)
  - 200-liter drum filling time calculator to estimate tubewell discharge rate (LPM)
- **Observations:** Extremely practical for resource-constrained farmers without electronic soil probes.

---

### Feature 8: Community Crop Alerts & Pest Reporting
- **Status:** **UI ONLY**
- **Backend API:** None.
- **Frontend Component:** `CommunityPage.jsx` using `config/communityData.js` and `localStorage`
- **Current State:** Displays pre-populated alerts (Yellow Rust in Punjab, Fall Armyworm in MP, Stubble burning advisory in Haryana). Users can submit a report or escalation ticket, but it only saves to browser `localStorage`.
- **Observations:** No live backend integration or crowdsourced sync exists. Should be clearly communicated as a community preview/prototype, rather than masquerading as a nationwide live surveillance network.

---

### Feature 9: Mandi Prices & MSP Tracker
- **Status:** **UI ONLY**
- **Backend API:** None.
- **Frontend Component:** `MarketPage.jsx` using `config/marketData.js`
- **Current State:** Renders interactive SVG price charts and MSP comparison cards, but data is completely hardcoded/simulated. There is no connection to the Agmarknet API or Government e-NAM portal.
- **Observations:** Misleading if presented as real-time market rates. Must be properly labeled as an illustrative prototype benchmark or regional reference.

---

### Feature 10: Session Activity & Field Reports
- **Status:** **PARTIALLY WORKING**
- **Frontend Component:** `ActivityPage.jsx`
- **Current State:** Every calculation and advisor chat during the active browser session is pushed to an in-memory array in `FarmContext`. Includes JSON export and filter tabs.
- **Limitations:** Data is lost upon browser reload; there is no persistent backend database or `localStorage` retention for past activity.

---

### Feature 11: Developer / Hackathon Diagnostics (Security, Evaluation, Architecture)
- **Status:** **WORKING / STATIC UI**
- **Components:** `SecurityCenterPage.jsx` (functional attack simulator), `EvaluationPage.jsx` (static metrics tables), `ArchitecturePage.jsx` (system diagrams), `AboutPage.jsx` (citations).
- **Observations:** Valuable for technical evaluators, but clutters the primary navigation for actual farmers.

---

## 5. Backend Endpoints vs Frontend Consumption Matrix

| Endpoint | Method | Purpose | Frontend Caller | Contract Status |
|---|---|---|---|---|
| `/` | GET | Root metadata & API directory | None (used for health probes) | Active |
| `/health` | GET | Liveness probe (fast, non-blocking) | `checkHealth()` in `api.js` (polled every 15s) | Active |
| `/ready` | GET | Readiness probe (validates engine & config) | None directly | Active |
| `/metrics` | GET | Prometheus telemetry metrics | None directly (consumed by Prometheus/cURL) | Active |
| `/api/v1/farm/analyze` | POST | Deterministic irrigation & impact analysis | `analyzeFarm()` in `api.js` | Fully integrated |
| `/api/v1/agent/advice` | POST | Conversational agent with tool execution | `getAgentAdvice()` in `api.js` | Fully integrated |

**Backend Gaps:**
- No endpoints for CRUD operations on Farm profiles (`/api/v1/farms`).
- No endpoints for persisting activity history or irrigation logs.
- No endpoints for community pest reports or APMC mandi price feeds.

---

## 6. Comprehensive UI/UX Problem Analysis

### 6.1 Information Overload and Cluttered Navigation
- **Problem:** 12 top-level navigation items in the sidebar. Technical screens ("Accuracy & Testing", "Field Safety Rules", "How It Works") are placed right next to daily farming tasks ("Check Water Need", "Ask FarmGuard").
- **Farmer Impact:** A farmer wanting to know "Should I turn on my tubewell today?" is overwhelmed by developer metrics, benchmark percentages, and architecture flowcharts.

### 6.2 Missing Multi-Farm Concept
- **Problem:** Only 1 farm can exist at a time. If a farmer has a 3-acre wheat plot and a 1-acre sugarcane plot, they have to constantly overwrite the form values.
- **Farmer Impact:** Frustrating; destroys confidence that the app understands their actual farming operations.

### 6.3 Fragmented Farmer Journey
- **Problem:** Currently, to get irrigation guidance, the farmer must go to `FarmAnalysisPage`, fill out a 10-field form, expand technical accordions, click "Calculate", and then scroll down a very long page to read the recommendation.
- **Farmer Impact:** The workflow is disjointed. The farmer journey must be seamless:
  1. Open Dashboard → View Active Field status & today's weather
  2. One-click check: "Water Need Today"
  3. Clear answer: "Don't water — 14mm rain coming tomorrow" or "Run tubewell for 3.5 hours"
  4. Instant access to AI Farm Assistant for doubts.

### 6.4 Developer Jargon & Cognitive Burden
- **Problem:** Terms like "Deterministic Tool Trace", "FAO-56 Penman-Monteith", "Pydantic Physical Bounds Check", "Zero-Trust Guardrail Gate", "Prometheus Latency Exposition", and "ET0 Evapotranspiration" appear throughout the primary interface.
- **Farmer Impact:** Distrust and confusion. While scientific rigor is essential, farmer-facing text must prioritize operational outcomes: "Recommended Water Depth", "Tubewell Pump Hours", "Rain Expected", "Money Saved on Electricity".

### 6.5 Form Usability & Mobile Layout
- **Problem:** Inputs for soil moisture (0-100%) and rainfall probability (0-100%) lack intuitive visual controls on mobile devices. Number steppers or fine sliders can be hard to operate with muddy or gloved hands in the field.
- **Farmer Impact:** Farmers need large tap targets, quick-selection cards for crops and soils, and visual status badges.

### 6.6 Trilingual Experience Inconsistencies
- **Problem:** While `i18n.js` has comprehensive translations for English, Hinglish, and Hindi, many labels and unit strings inside components (e.g. `Liters/acre`, `kWh Draw`, `Mandi Price vs MSP`) remain hardcoded in English.
- **Farmer Impact:** Incomplete immersion when a farmer selects Hindi or Hinglish.

---

## 7. Audit Classification Summary

| Category | Count | Features / Modules |
|---|---|---|
| **WORKING** | 5 | Deterministic Farm Calculator, Conversational AI Agent, Open-Meteo Weather Integration, Savings & Energy Calculator, Soil & Pump Estimation Helpers |
| **PARTIALLY WORKING** | 3 | Home Dashboard (works with default farm), Add/Edit Farm (embedded in calculator), Activity Log (session-only memory) |
| **UI ONLY** | 4 | Community Crop Alerts, Mandi & MSP Tracker, Evaluation Benchmark Tables, Architecture Explainer |
| **NOT IMPLEMENTED** | 3 | Multi-Farm Management & Field Switching, Persistent Field Storage, Live Government Mandi API Sync |

---

## 8. Recommendations for Redesign (Phases 2–5)

1. **Reorganize Navigation Hierarchy:**
   - Group core daily farmer tasks: **Dashboard**, **My Fields**, **Water Advice**, **Weather**, **Farm Assistant (AI)**.
   - Separate secondary tools: **Savings & Impact**, **Community Alerts** (labeled Prototype), **Market Prices** (labeled Reference).
   - Move technical diagnostic screens (Security, Benchmarks, Architecture) into an accessible **System & Developer Lab** drawer or bottom section, decluttering the farmer's primary interface.

2. **Implement LocalStorage-Backed Multi-Farm Management:**
   - Allow farmers to create, name, edit, and switch between multiple farm fields (e.g., "Khet 1 - 2.5 Acres Wheat", "Khet 2 - 1.0 Acre Paddy").
   - Retain active field selection across the entire app.

3. **Streamline the Irrigation Recommendation View:**
   - Give the farmer immediate, high-contrast, traffic-light clarity:
     - 🟢 **Optimal Soil Moisture** — Hold irrigation.
     - 🟡 **Rain Forecast Sufficient** — Postpone irrigation, save tubewell diesel/electricity.
     - 🔴 **Irrigate Now** — Run tubewell for X hours (Y mm depth).
   - Display actionable numbers prominently: Litres needed, Tubewell hours, Electricity cost saved.

4. **Ensure Complete Trilingual Consistency:**
   - Unify English, Hinglish, and Hindi throughout all screens, inputs, error states, and numerical units.

5. **Eliminate All Misleading Data Claims:**
   - Mark Community Alerts and Mandi Prices honestly as prototype/reference modules so farmers and evaluators know exactly what is live and what is planned.
