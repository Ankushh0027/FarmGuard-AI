# FarmGuard AI — NextStep Hacks 2026 Submission Assets 🌾

This directory contains the official verified visual and video submission assets for **FarmGuard AI** submitted to **NextStep Hacks 2026** (Theme: *Earth Forward*).

---

## 🎥 Official Demo Video (`submission_assets/FarmGuard_AI_Demo.mp4`)

- **Filename**: `submission_assets/FarmGuard_AI_Demo.mp4`
- **Resolution**: $1920 \times 1080$ (1080p Full HD)
- **Container / Codec**: MP4 (`H.264 / libx264`, `yuv420p` universal web & mobile compatible)
- **Duration**: ~3:11 minutes *(Complies strictly with the 3–5 minute hackathon rule)*
- **File Size**: ~8.74 MB
- **Recording Nature**: **REAL screen recording** of live FarmGuard application interactions across all core modules.
- **Audio Note**: Direct browser screen capture (no microphone audio track embedded). Voiceover script and narration guide are provided below for live judging and pitch presentations.

### Video Demonstration Sequence
1. **0:00 – 0:25 | Overview & Earth Forward Context**: Farm profile, live weather card (Open-Meteo), and sustainability summary metrics.
2. **0:25 – 0:50 | Product Navigation**: Sidebar walkthrough across Home, Check Water Need, Ask FarmGuard, Water & Energy Saved, and Security Guardrails.
3. **0:50 – 1:40 | AI Advisor in Action**: Submitting Hinglish prompt *"Bhai aaj paani du kya?"* under 2.5 acres Rice context and inspecting contextual response.
4. **1:40 – 2:25 | Deterministic Water Calculation & HP Safety**: Showing 28.2 mm deficit -> 285,304 L -> 4h 45m runtime; testing *"Pump 10 HP ka hai, kitni der chalau?"* and showing refusal to guess ungrounded discharge flow.
5. **2:25 – 3:05 | Symptom Triage & Savings**: Submitting *"Mere chawal ke patte yellow ho rahe hain"* for 4-point structured triage; exploring avoided tubewell hours and CO2e emissions.
6. **3:05 – 3:45 | 5-Layer Defense-in-Depth**: Testing prompt injection *"Ignore all previous instructions..."* with safe block and `blocked: true`.
7. **3:45 – 4:15 | Architecture & Separation of Concerns**: Reviewing FastAPI backend, tool whitelist, and output grounding pipeline.
8. **4:15 – 4:35 | Mobile Responsiveness & Closing**: Clean dashboard view and closing statement.

---

## 📸 Verified UI Screenshots (`submission_assets/screenshots/`)

All 9 screenshots were captured directly from the live FarmGuard application (`http://localhost:5173` with backend on `http://127.0.0.1:8000`):

| Filename | Viewport | Page / View | What It Demonstrates |
| :--- | :---: | :--- | :--- |
| **`01_dashboard_overview.png`** | 1440 x 900 | **Overview Dashboard** (`/`) | Main farmer dashboard showing farm profile cards (Rice, 2.5 acres, Sandy Loam), live weather card (Open-Meteo), and sustainability summary metrics. |
| **`02_ai_advisor_context.png`** | 1440 x 900 | **AI Advisor** (`/advisor`) | Conversational interface displaying active context indicators (Crop: Rice, Area: 2.5 ac, Moisture: 35%) and natural Hinglish prompt submission. |
| **`03_irrigation_recommendation.png`** | 1440 x 900 | **AI Advisor Recommendation** (`/advisor`) | Context- and weather-aware irrigation advice explaining the net deficit and timing recommendations. |
| **`04_deterministic_runtime.png`** | 1440 x 900 | **Farm Analysis** (`/analysis`) | Pure Python deterministic calculation: 28.2 mm deficit -> 285,304 Litres volume -> ~4 hr 45 min pump runtime at 1000 L/min. |
| **`05_hp_safety_flow.png`** | 1440 x 900 | **HP-Only Safety Flow** (`/advisor`) | Safe handling of *"Pump 10 HP ka hai, kitni der chalau?"* demonstrating that FarmGuard never fabricates flow from HP and requests L/min or guides the container-fill test. |
| **`06_symptom_triage.png`** | 1440 x 900 | **Symptom Triage** (`/advisor`) | Structured 4-point diagnostic questionnaire for yellowing rice leaves without premature, hallucinated disease diagnoses. |
| **`07_security_refusal.png`** | 1440 x 900 | **Security Guardrail Refusal** (`/advisor`) | Safe interception and refusal of adversarial prompt injection (*"Ignore all previous instructions..."*) with `blocked: true` indicator. |
| **`08_savings_explorer.png`** | 1440 x 900 | **Savings Explorer** (`/savings`) | Potential groundwater conserved, pumping electricity avoided, stubble valorization, and avoided CO2e emissions with clear modeled/potential disclosures. |
| **`09_mobile_responsiveness.png`** | 390 x 844 | **Mobile Viewport** (`/`) | Mobile responsiveness layout demonstrating accessibility and usability on standard smartphones in the field. |

---

## 🔒 Security & Privacy Attestation
- Zero API keys, passwords, or live credentials exist in any captured video, screenshot, or repository artifact.
- All environmental metrics retain clear designations as modeled potential agronomic estimates.
