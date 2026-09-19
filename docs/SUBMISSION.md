# FarmGuard AI — Hackathon Submission Overview 🌾

> **NextStep Hacks 2026** | **Theme: Earth Forward**  
> **Repository**: [FarmGuard AI](https://github.com/Ankushh0027/FarmGuard-AI)

---

## 📌 Project Summary

- **Project Title**: FarmGuard AI
- **Tagline**: Personal AI decision-support for farmers.
- **Short Description**: FarmGuard AI is an India-specific agricultural decision-support assistant that combines field context, deterministic agronomic calculations, live weather integration, and defense-in-depth security guardrails to help farmers optimize irrigation, save groundwater, cut electricity costs, and manage crop residue sustainably.

---

## 🌾 The Problem

Smallholder farmers across India face critical challenges with severe environmental consequences:
1. **Aquifer Depletion & Over-Irrigation**: Over-pumping of tubewells is driven by uncertainty around weather forecasts and soil moisture, causing groundwater tables in states like Punjab and Uttar Pradesh to decline by up to 1 meter annually.
2. **High Operational Energy Costs**: Agricultural tubewell pumping consumes ~18% of India's grid electricity, while diesel-dependent farmers incur high fuel costs.
3. **Seasonal Stubble Burning**: The absence of practical on-field residue management strategies leads to seasonal crop burning and severe air quality crises.
4. **Unreliable AI Tools**: Standard LLM chatbots frequently hallucinate mathematical calculations, fabricate dosages, and deliver generic responses unsuited for real-world farming.

---

## 💡 The Solution

FarmGuard AI solves these challenges through **strict separation of calculation math and AI synthesis**:
- **Pure Python Calculation Engine**: All agronomic models, depth-to-volume conversions ($1\text{ acre-mm} \approx 4,046.86\text{ L}$), and pump running hours ($\text{Minutes} = \frac{\text{Litres}}{\text{L/min}}$) are computed deterministically.
- **Live Weather Ingestion**: Automatically factors rainfall depth and probability into irrigation deficits using Open-Meteo.
- **Farmer-Friendly AI Advisor**: Powered by Google Gemini (`gemini-2.5-flash`), delivering concise, empathetic advice in English, Hindi, and natural Hinglish with persistent session memory.
- **Defense-in-Depth Guardrails**: Multi-tier security scanning that intercepts prompt injection attacks, prevents credential leakage, restricts tool execution via whitelist, and grounds all output numbers.

---

## 🌟 Key Features

1. **Precision Field Water Plan**: Calculates exact water requirement in mm and converts directly into field volume in litres based on user acreage.
2. **Deterministic Pump Running Time**: Calculates exact hours and minutes of pump runtime from water discharge in L/min.
3. **Container-Fill Flow Assistant**: Optional practical in-field test to estimate tubewell water flow using a standard drum or bucket.
4. **AI Advisor with Conversational Memory**: Remembers field parameters across multi-turn interactions with natural Hinglish support and 1-click chat reset.
5. **Disease & Symptom Triage**: Employs structured diagnostic triage (crop, age, leaf position, watering) rather than text-only diagnoses.
6. **Sustainable Stubble Alternatives**: Recommends mulching, Super SMS, and bio-decomposer practices with estimated economic valorization.
7. **Interactive Savings Explorer**: Computes tubewell pumping hours avoided, electricity bill reductions, and avoided $\text{CO}_2\text{e}$ emissions.

---

## 🏗️ Technical Architecture

```
User (Web / Mobile) ──► React + Vite Frontend
                              │ (REST / JSON)
                              ▼
                      FastAPI Backend
                              ├── Input Bounds Validation
                              ├── Prompt Injection & Secret Scanner
                              ├── Farm Agent Coordinator
                              │     ├── Session Context Memory
                              │     ├── Whitelist Tool Authorization
                              │     ├── Open-Meteo Weather API
                              │     └── Pure Python Agronomic Engine
                              │           └── Deterministic Math (mm, L, hrs, CO2e)
                              ├── Gemini Synthesis (gemini-2.5-flash)
                              ├── Output Numerical Grounding (Hallucination Catch)
                              └── 8-Dimension Deterministic Evaluation
```

---

## 🛡️ Security & Guardrails

- **Prompt Injection Defense**: Multi-pattern scanner blocks malicious instruction overrides and developer jailbreaks.
- **Zero Secret Leakage**: Continuous regex scanning ensures API keys, tokens, and environment paths are never exposed.
- **Tool Whitelist**: Strictly restricts execution to registered, authorized calculation and weather tools with input/output validation.
- **Missing-Data Protection**: Explicitly prompts for missing inputs without fabricating farm parameters.
- **Numerical Grounding**: Compares synthesized numbers against calculation outputs; triggers safe fallback if discrepancies occur.

---

## 🧪 Evaluation & Verification Results

- **Automated Backend Tests**: **114 passed / 0 failed** in `pytest -v`.
- **12 Targeted Assistant Quality Scenarios**: Verified for missing data handling, MM explanation, pump runtime calculation, HP clarification, disease triage, weather logic, Hinglish interaction, prompt injection defense, and secret protection.
- **Adversarial Benchmark (107 cases)**: 100% block rate on malicious vectors with 0.0% false positive rate on benign agricultural questions.
- **Frontend Production Build**: `npm run build` compiles with zero errors in $< 2$ seconds.
- **Responsive Viewport Verification**: Fully verified at $375 \times 812$, $390 \times 844$, and $1440 \times 900$.

---

## 🌍 Sustainability Impact

- **Groundwater Conservation**: Reduces over-irrigation by up to 20–30% by accounting for soil moisture deficits and upcoming rain.
- **Grid Energy & Fuel Reduction**: Every tubewell hour avoided saves ~3.7 kWh of electricity or ~1.8 L of diesel.
- **Air Quality & Soil Health**: Incentivizes in-situ stubble retention, avoiding ~1,460 kg of $\text{CO}_2\text{e}$ and ~7.5 kg of $\text{PM}_{2.5}$ per tonne of residue.

---

## ⚠️ Limitations & Future Scope

### Current Limitations
- AI advice is decision support, not an absolute agronomic authority.
- Exact pump running time requires an accurate water flow measurement in L/min.
- Current prototype covers Wheat, Rice, Maize, and Sugarcane.

### Future Roadmap
- Localized real-time mandi price feeds via Agmarknet.
- Direct subsidy guidance for PM-KUSUM (solar pumps) and PMKSY.
- Multilingual regional voice interface for hands-free field use.
- Direct integration with Soil Health Card laboratory testing data.
