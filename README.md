# FarmGuard AI 🌾

> **Personal AI Decision-Support for Farmers**  
> *NextStep Hacks 2026 | Theme: Earth Forward*

---

## 1. Problem

Smallholder farmers across India face critical daily operational uncertainties:
- **Irrigation Uncertainty**: Over-watering and under-watering are widespread due to difficulty in interpreting raw weather forecasts, rainfall probabilities, and soil moisture levels.
- **Excessive Groundwater Pumping**: Over-pumping depletes critical groundwater aquifers, inflates electricity and diesel costs, and leaches nutrients from the root zone.
- **Crop Residue & Stubble Burning**: Post-harvest stubble is often burned due to a lack of actionable management alternatives and valorization pathways, creating severe seasonal air pollution.
- **Fragmented Guidance**: Agricultural advice is often either overly academic, disconnected from the farmer's specific field size, or reliant on generic chatbot answers that hallucinate numbers.

---

## 2. Solution

**FarmGuard AI** is a farmer-friendly decision-support assistant that provides grounded, practical answers to everyday agricultural questions. 

It combines:
1. **Field Context**: Crop type, acreage, soil condition, and location.
2. **Deterministic Calculations**: Exact water volumes, pump running hours, and residue estimates computed via pure Python formulas—never by LLM math.
3. **Live Weather Context**: Precipitation depth and probability integration via Open-Meteo.
4. **Defense-in-Depth AI Guardrails**: Multi-tier input verification, prompt injection defense, secret leak prevention, tool authorization, and numerical grounding.
5. **Practical Farmer Language**: Clear, concise advice in English, Hindi, and natural Hinglish that directly answers: *"Kitna paani dena hai, aur pump kitni der chalana hai?"*

---

## 3. Core Features

- **Personalized Field Water Plan**: Translates raw depth recommendations (mm) into field-specific volumes in litres ($1\text{ acre-mm} \approx 4,046.86\text{ L}$).
- **Flow-Based Pump Runtime**: Calculates deterministic pump running hours and minutes from water flow ($\text{Minutes} = \frac{\text{Litres}}{\text{L/min}}$). HP alone is never used to guess runtime.
- **Container-Fill Flow Assistant**: Optional in-field estimation tool to measure tubewell water flow using a standard container.
- **Conversational Memory**: Retains farm parameters (crop, acreage, soil, moisture, pump flow) across multi-turn queries with 1-click reset.
- **Disease & Symptom Triage**: Symptom inquiries (e.g. yellow leaves) trigger structured agronomic questions instead of text-only diagnoses.
- **Stubble Management Alternatives**: Practical, non-burning residue practices (mulching, Super SMS, bio-decomposer) with estimated economic valorization.
- **Interactive Water & Energy Savings**: Transparent modeling of tubewell pumping hours saved, electricity bill reduction, and avoided $\text{CO}_2\text{e}$ emissions.
- **AI Safety & Defense-in-Depth**: Blocks prompt injections, protects secrets, restricts tool access via whitelist, and validates numerical consistency.

---

## 4. Architecture

FarmGuard AI enforces a strict architectural separation between **deterministic calculation logic** and **LLM synthesis**:

```
Farmer / User (Web or Mobile)
      │
      ▼
FarmGuard Frontend (React + Vite, AgriTech Design System)
      │  HTTP REST / JSON
      ▼
FastAPI Backend (Production API, Rate Limiting, Auth, CORS)
      │
      ├── 1. Input Guardrails (Physical bounds & message size check)
      ├── 2. Security Guardrails (Prompt injection & secret scanning)
      │
      ▼
FarmGuard Agent Coordinator (farm_agent.py)
      │
      ├── 3. Session Context & Slot Extraction
      ├── 4. Tool Authorization & Whitelist Enforcement
      │       ├── Weather Tool (Open-Meteo Live Forecast)
      │       └── Farm Calculation Engine (Deterministic Python)
      │             ├── Crop Water Requirement Model
      │             ├── Soil Moisture Deficit Calculation
      │             ├── Field Volumetric Translation (Litres)
      │             ├── Pump Runtime Calculation (Hours & Mins)
      │             └── Stubble & Environmental Modeling
      │
      ├── 5. Tool Output Validation (No NaN/Inf, Non-negative)
      ├── 6. Gemini Synthesis (Synthesizes verified numbers into farmer advice)
      ├── 7. Output Guardrails & Numerical Grounding (Catches any LLM hallucination)
      │       └── Safe Deterministic Template Fallback (Engages on deviation)
      └── 8. Deterministic 8-Dimension Evaluation Engine
      │
      ▼
Validated, Farmer-Friendly Response
```

---

## 5. AI & Agent Design

- **Context Retention**: Session memory maintains active field parameters without repetitive questioning.
- **Information Gap Analysis**: If critical information (e.g., crop type, acreage, or soil moisture) is missing, the agent asks only for the necessary fields.
- **Controlled Tool Execution**: Tools are authorized through a strict whitelist. The LLM does not execute arbitrary code or call external APIs unmonitored.
- **Numerical Grounding**: Every number in the advisory is verified against the deterministic calculation layer. If an LLM response alters a numerical value, the output guardrail intercepts the response and falls back to a verified deterministic template.
- **Uncertainty & Safety**: 0 mm irrigation is explicitly framed as a prototype recommendation to postpone irrigation under current conditions, avoiding false certainty.

---

## 6. Security & Safety

| Security Layer | Mechanism | Protection |
| :--- | :--- | :--- |
| **Input Validation** | Physical bound checks on crop, area ($> 0$), moisture ($0-100\%$), rainfall, and message length ($< 2,000$ chars). | Rejects impossible agronomic inputs and malformed payloads. |
| **Prompt Injection Defense** | Multi-pattern heuristic and token-level scanner. | Blocks instruction overrides, jailbreaks, roleplay escapes, and tool bypasses. |
| **Secret Protection** | Regex scanning for API keys (`AIzaSy...`), credentials, environment variables, and internal paths. | Prevents secret extraction and redacts credentials. |
| **Tool Whitelist** | Pre-execution authorization table with typed schema enforcement. | Blocks unauthorized tool invocations and prevents parameter tampering. |
| **Missing-Data Safety** | Strict missing-field detection. | Never fabricates acreage, moisture, rainfall, pump hours, or disease diagnoses. |
| **Output Grounding** | Regex-based numerical extraction and tolerance comparison against tool results. | Intercepts hallucinations and enforces policy compliance. |

---

## 7. Evaluation & Verification

FarmGuard AI has been tested and verified across multiple automated benchmarks:

- **Pytest Suite**: **114 passed / 0 failed** across unit, API, integration, and guardrail tests.
- **12 Targeted Assistant Quality Scenarios**: Verified for missing data handling, MM explanation, pump runtime calculation, HP clarification, disease triage, weather logic, Hinglish interaction, prompt injection defense, and secret protection.
- **Adversarial Security Suite**: 107 test cases verifying 100% block rate on malicious attacks with 0.0% false positive rate on benign agricultural questions.
- **Frontend Production Build**: `npm run build` compiles with zero errors or broken imports.
- **Responsive Layout Verification**: Fully verified at $375 \times 812$, $390 \times 844$, and $1440 \times 900$ viewports.
- **Dynamic Field Scaling**: Linear volume scaling verified across arbitrary field sizes ($0.5$ to $10.0$ acres).

---

## 8. Tech Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Google GenAI SDK (`google-genai`), Uvicorn, Pytest.
- **Frontend**: React 18, Vite, Lucide React icons, Vanilla CSS AgriTech Design System.
- **Weather Integration**: Open-Meteo REST API (with regional fallback norms).
- **Deployment & Containerization**: Docker, Docker Compose, ASGI production configuration.

---

## 9. Local Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run development server
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Automated Tests
```bash
# Backend test suite (114 tests)
cd backend
pytest -v

# Frontend production build
cd frontend
npm run build
```

---

## 10. Project Structure

```
FarmGuard-AI/
├── backend/
│   ├── app/
│   │   ├── agents/          # FarmGuard LLM Agent & conversational coordinator
│   │   ├── api/             # FastAPI routers, production middleware, rate limiter
│   │   ├── calculations/    # Pure Python deterministic agronomic formulas
│   │   ├── evaluation/      # 8-dimension LLM evaluation & benchmark runner
│   │   ├── guardrails/      # Input bounds, prompt injection, secret scan, output grounding
│   │   ├── models/          # Pydantic data schemas
│   │   ├── observability/   # Structured logging & Prometheus metrics
│   │   ├── services/        # Weather service (Open-Meteo client)
│   │   └── tools/           # Authorized agricultural calculation tools
│   ├── tests/               # Pytest suite (114 tests) & adversarial cases
│   ├── Dockerfile           # Backend container image
│   ├── requirements.txt     # Python dependencies
│   └── main.py              # Application entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/      # UI badges, navigation, layout cards
│   │   ├── config/          # Agricultural crop data, soils, regions
│   │   ├── context/         # FarmContext state & conversational memory
│   │   ├── pages/           # Overview, Analysis, AI Advisor, Savings, Security, etc.
│   │   ├── services/        # Backend API client
│   │   └── index.css        # AgriTech light design system tokens
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
├── docs/
│   ├── ARCHITECTURE.md      # Detailed system architecture & dataflow diagrams
│   ├── SECURITY.md          # Threat model, guardrails & defense-in-depth specifications
│   ├── DEMO_SCRIPT.md       # 2-3 minute structured presentation script
│   └── SUBMISSION.md        # Official hackathon project summary & metadata
├── docker-compose.yml       # Production container orchestration
└── README.md                # Project documentation
```

---

## 11. Limitations

- **Decision Support, Not Agronomic Authority**: FarmGuard AI is an advisory decision-support tool. It does not replace on-site agronomic inspection or agricultural extension officers for critical crop disease or chemical decisions.
- **Pump Flow Dependency**: Exact pump running times require an accurate measurement of water discharge in litres per minute. HP alone cannot determine running time without knowing water flow.
- **External Weather Availability**: Real-time rainfall predictions depend on Open-Meteo service availability. When offline or unreachable, FarmGuard falls back to regional agricultural defaults.
- **Supported Scope**: Current prototype models cover Wheat, Rice, Maize, and Sugarcane across major Indian agro-climatic zones.

---

## 12. Future Scope

- **Localized Mandi Prices**: Real-time market price feeds from Agmarknet for crop planning.
- **Government Scheme Advisory**: Direct guidance on PM-KUSUM (solar pumps), PMKSY (micro-irrigation), and Soil Health Card subsidies.
- **Multilingual Voice Interface**: Speech-to-text and text-to-speech support for regional Indian languages and dialects.
- **Soil Health Card Integration**: Direct ingestion of NPK and micronutrient test data to optimize fertilizer dosing.
- **Agronomist Escalation Network**: 1-click referral of unresolved disease symptoms to local Krishi Vigyan Kendra (KVK) extension specialists.
