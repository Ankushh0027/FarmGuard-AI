# FarmGuard AI — Product Structure & Roadmap

**Date:** November 2026  
**Document Purpose:** Define the canonical farmer journey, structure feature tiers, and establish a clear roadmap distinguishing existing capabilities from UI improvements and planned future expansions.

---

## 1. Canonical Farmer Journey

The FarmGuard AI product is designed around a practical, frictionless workflow for Indian farmers:

```
┌────────────────────────┐
│ 1. Open FarmGuard      │  Farmer opens app on mobile/desktop; sees today's field summary,
│    Dashboard           │  weather snapshot, and active field status at a glance.
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 2. Select or Add       │  Farmer selects an existing field (e.g., "North Khet - Wheat")
│    Farm / Field        │  or adds a new field with crop, acreage, soil, and pump type.
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 3. Check Crop & Soil   │  Farmer updates or confirms current soil moisture (via 6-inch hand test
│    Status              │  or sensor) and current irrigation stage.
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 4. View Local Weather  │  App fetches live 7-day precipitation forecast and ET0 from Open-Meteo;
│    & Rain Forecast     │  informs the farmer if rain will naturally irrigate the field.
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 5. Get Instant Water   │  Deterministic calculation produces a definitive action:
│    Recommendation      │  "Postpone (Rain coming)", "Irrigate Now", or "Hold (Sufficient moisture)".
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 6. Understand Numbers  │  Farmer sees operational specifics: exact tubewell pump running hours,
│    & Impact            │  water depth in mm, electricity saved in ₹, and stubble guidance.
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 7. Consult AI Farm     │  Farmer asks specific questions in Hindi, Hinglish, or English
│    Assistant (as need) │  (e.g., "Pani kab lagau?", "Pili patti ki dawa", fertilizer timing).
└────────────────────────┘
```

---

## 2. Feature Segmentation

To ensure total transparency and avoid fabricating capabilities, all features are strictly segregated into three distinct categories:

### A. Existing Working Features (Supported by Current Code)
Features that are fully backed by existing backend APIs, client-side calculation engines, or third-party live services:

1. **Deterministic Farm Calculation Engine:**
   - Single-irrigation net water depth (mm) calculation based on FAO-56 depletion and soil retention factors.
   - Pumping volume (Liters and m³) and tubewell runtime duration (hours/minutes) based on pump discharge (LPH / LPM).
   - Crop residue generation estimate (tonnes/acre) and burning risk classification.
   - Environmental emission avoidance (CO2e kg, PM2.5 kg).
   - Structured assumption disclosure.
   - *Backend Endpoint:* `POST /api/v1/farm/analyze` & client fallback.

2. **Conversational Agricultural AI Advisor:**
   - Multi-turn conversational interface with farm context memory.
   - Trilingual support (Devanagari Hindi, Roman Hinglish, Indian English).
   - Deterministic tool orchestration (agent fetches real weather and calls calculation tools; never invents numbers).
   - Multi-tier safety guardrails (prompt injection block, secret scanning, physical bounds checking).
   - Structured execution trace audit for transparency.
   - *Backend Endpoint:* `POST /api/v1/agent/advice` & offline synthesis fallback.

3. **Live Meteorological Data:**
   - Real-time 7-day forecast from Open-Meteo (precipitation sum, rain probability, max/min temperature, FAO-56 reference evapotranspiration ET0).
   - 13 pre-configured Indian agricultural states/regions with coordinate resolution.
   - *Service:* `app/services/weather_service.py` & direct HTTPS Open-Meteo client.

4. **Resource & Monetary Savings Analytics:**
   - Interactive pump power rating selector (3 HP, 5 HP, 7.5 HP, 10 HP).
   - Configurable electricity tariff (₹/kWh).
   - Per-irrigation and seasonal 4-stage water, electricity, tubewell hours, and monetary savings.
   - Comparison of precision irrigation vs traditional flood irrigation.

5. **Practical Soil & Pump Diagnostic Helpers:**
   - 6-inch hand ball test guide for estimating soil moisture percentage without electronic probes.
   - 200-liter drum filling time calculator to calculate actual tubewell pump discharge (LPM).

6. **System Observability & Health:**
   - Non-blocking `/health` and `/ready` probes.
   - Prometheus metrics exposition (`/metrics`).
   - Interactive red-team security attack simulation console.

---

### B. UI Improvements (Implemented in this Redesign)
Enhancements made strictly on the frontend to improve ergonomics, clarity, and the farmer workflow without requiring backend schema alterations:

1. **Multi-Farm / Field Management (Local Persistence):**
   - Store multiple named farm fields (e.g., "Khet 1 - North Plot (Wheat)", "Khet 2 - Canal Side (Rice)") in browser `localStorage`.
   - Dedicated "My Farms" drawer/page to switch, add, edit, or delete farm fields seamlessly.
   - Selected farm automatically updates dashboard, weather, and AI advisor context.

2. **Clean Two-Tier Navigation:**
   - **Primary Farmer Navigation (Daily Essentials):**
     1. Dashboard (Daily Water Decision & Field Snapshot)
     2. My Farms & Fields (Manage land parcels)
     3. Water Recommendation (Run instant check)
     4. Weather & Rain (7-day rain forecast)
     5. AI Farm Assistant (Trilingual advisor)
     6. Savings & Impact (Water, energy, & money saved)
   - **Secondary & Reference Tools:**
     - Community Alerts (Clearly labeled "Regional Prototype")
     - Mandi & MSP Rates (Clearly labeled "Market Reference")
     - Field History & Activity (Session & local records)
   - **Developer & Verification Suite:**
     - Security Guardrails, Accuracy Benchmarks, and System Architecture grouped into a separate, clean "System Verification" section.

3. **High-Contrast "Traffic Light" Recommendation Hero:**
   - Replace complex developer tables with an unmissable recommendation banner:
     - 🟢 **Optimal Soil Moisture** — Hold irrigation.
     - 🟡 **Postpone Irrigation** — Rain forecast sufficient; save water and pumping costs.
     - 🔴 **Irrigate Now** — Run pump for X hours.
   - Clear numerical badges: Recommended Depth (mm), Volume (Liters), Pump Runtime (Hours/Minutes).

4. **Universal Trilingual Language Selector & Full Localization:**
   - Dedicated Settings & Language switch (English, Roman Hinglish, Devanagari Hindi) with persistent state.
   - Complete localized dictionaries ensuring no English jargon leaks into Hindi or Hinglish modes.

5. **Mobile-First Responsive Layout:**
   - Bottom navigation bar on mobile viewports for quick thumb access.
   - Touch-friendly input steppers and cards for field size and soil moisture.
   - Accessible font sizes and high-contrast color palette adhering to WCAG 2.1 AA standards.

---

### C. Future Features (Separate Backend & Data Integrations Needed)
Features planned for future releases that require dedicated backend infrastructure, cloud databases, or official government APIs before they can be marked operational:

1. **User Authentication & Multi-Device Cloud Sync:**
   - Backend user account management (OTP-based phone number login suitable for Indian farmers).
   - PostgreSQL/Supabase database storing farm profiles, sensor configurations, and historical irrigation logs.

2. **Live Agmarknet / e-NAM Mandi Integration:**
   - Automated ingestion pipeline connecting to data.gov.in / Agmarknet API for daily real-time wholesale APMC commodity prices across Indian mandis.

3. **Crowdsourced Pest & Crop Disease Network:**
   - Backend REST endpoints for submitting geo-tagged crop issue reports with photos.
   - Integration with ICAR / State Agriculture Department Krishi Vigyan Kendra (KVK) advisory bulletins.

4. **IoT Soil Sensor & Smart Relay Integration:**
   - Direct MQTT/HTTP telemetric ingestion from affordable LoRaWAN or ESP32 soil moisture sensors.
   - Automated smart relay control to turn tubewell pumps off when target root-zone moisture is reached.

5. **Satellite Vegetation Index (NDVI / NDWI) Ingestion:**
   - Sentinel-2 / Landsat optical and moisture index layers overlaid on farm boundary polygons to detect crop water stress before visual wilting occurs.

---

## 3. Product Roadmap Timeline

| Phase | Milestone | Scope & Deliverables | Status |
|---|---|---|---|
| **Phase 1** | Product Audit | Full inspection of code, APIs, and screens; classification of all features. | ✅ Complete |
| **Phase 2** | Product Roadmap | Farmer journey definition, feature stratification (A/B/C), and release milestones. | ✅ Complete |
| **Phase 3** | UI/UX Design System | Color palette, typography, responsive grid, atomic components, and trilingual design tokens. | 🔄 Current Phase |
| **Phase 4** | Screen-by-Screen Redesign | Architectural wireframing and restructuring of all 10 core screens. | 🔄 Upcoming |
| **Phase 5** | Frontend Implementation | Code refactoring, reusable UI components, multi-farm manager, and responsive styling. | 🔄 Upcoming |
| **Phase 6** | Verification & Build | Cross-device testing (desktop/tablet/mobile), build validation, and verification report. | 🔄 Upcoming |
| **Phase 7** | Backend Cloud Persistence | User accounts, PostgreSQL multi-field persistence, and real-time alerts. | 📅 Future |
| **Phase 8** | Government API Integration | Live Agmarknet mandi feeds and KVK pest alert bulletin sync. | 📅 Future |
