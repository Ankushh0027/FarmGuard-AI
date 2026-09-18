# FarmGuard AI Frontend 🌾

Modern, responsive React + Vite web application for **FarmGuard AI** (NextStep Hacks 2026 - Earth Forward).

---

## 🧭 Information Architecture

The frontend is structured as a multi-page agricultural SaaS product:

### 1. Main Navigation
- **Overview (`/`)**: Executive farm snapshot, current moisture/rain status, recent activities, quick action launcher, and intelligence explainer.
- **Farm Analysis (`/analysis`)**: 2-column precision irrigation optimizer. Inputs farm, crop, soil, and weather signals and computes deterministic $ET_c$ deficits, water saved, and carbon reduction.
- **AI Advisor (`/advisor`)**: Dedicated conversational assistant with active farm context panel, suggested prompts, and expandable "How FarmGuard reasoned" tool execution traces.
- **Weather Intelligence (`/weather`)**: Regional weather forecast lookup for major Indian agricultural states with actionable agronomic decision translation.

### 2. Insights & Telemetry
- **Activity (`/activity`)**: Chronological audit log of farm analyses, consultations, and tool calls with `X-Request-ID` correlation tracing and JSON export.
- **Evaluation (`/evaluation`)**: Interactive metrics dashboard presenting Phase 5 Adversarial and Phase 6 Agent Behavioral benchmark results (100% tool selection, 100% sequence correctness, 97.5% grounding).

### 3. Security & Architecture
- **Security Center (`/security`)**: 5-layer visual defense architecture and live interactive Red-Team / Prompt Injection Simulator.
- **Architecture (`/architecture`)**: Detailed pipeline explanation of deterministic calculation tools decoupled from LLM synthesis.
- **About (`/about`)**: Hackathon mission, agronomic principles, and methodology.

---

## 🚀 Running the Frontend Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Development Server
```bash
cd frontend
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Generates optimized static assets in `frontend/dist`.
