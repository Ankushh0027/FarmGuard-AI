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
- **Adversarial Benchmark (107 cases)**: 100% safe handling rate across 85 attack vectors and 22 benign controls with 0.0% false positive rate and 0.0% secret leak rate.
- **Frontend Production Build**: `npm run build` compiles with zero errors in $< 2$ seconds.
- **Responsive Viewport Verification**: Fully verified at $375 \times 812$, $390 \times 844$, and $1440 \times 900$.

---

## ⏳ Pre-Hackathon Foundation vs. Hackathon Period Work

In compliance with official Devpost Hackathon rules regarding continuing projects:

### A. Pre-Existing Foundation (Prior to Hackathon)
- Basic mathematical formulas for agricultural evapotranspiration and irrigation deficit calculation.
- Initial baseline FastAPI skeleton and standard Pydantic schema templates.
- Baseline reference agronomic datasets for Northern Indian major crops (ICAR / PAU reference tables).

### B. Developed & Completed During NextStep Hacks 2026
- **Google Gemini 2.5 Flash Agentic Core**: Multi-turn agricultural decision-support agent with persistent session memory.
- **5-Layer Defense-in-Depth Guardrail System**: Real-time prompt injection detector, automated regex secret scanner, strict tool authorization whitelist, schema bounds validation, and output grounding validator.
- **107-Case Adversarial Benchmark Harness**: Automated security and reliability evaluation suite spanning 85 attack vectors and 22 benign controls.
- **Modern Multi-Page React + Vite SaaS Frontend**: Complete UI suite with Overview, Farm Analysis, AI Advisor with context indicators, Savings Explorer, and Security Center.
- **Farmer-First Agronomic Translations**: Deterministic mm-to-Litres volume conversion ($1\text{ mm} \times 1\text{ acre} \approx 4,046.86\text{ L}$) and discharge-based pump running hours calculation ($\text{Minutes} = \frac{\text{Litres}}{\text{L/min}}$).
- **HP-Only Discharge Safety Logic**: Prevents arbitrary flow rate hallucination by enforcing L/min flow inputs and providing practical container-fill testing instructions.
- **Symptom Triage Workflow**: Structured 4-point diagnostic questionnaire for crop symptoms without text-only overconfident disease claims.
- **Resilience Fallback Mechanisms**: Deterministic rule-based fallback when external LLM APIs timeout or hallucinate numbers.

---

## 🌍 Earth Forward Track Alignment & Potential Environmental Impact

FarmGuard AI directly addresses the **Earth Forward** theme by tackling unsustainable water extraction, energy waste, and agricultural burning:

1. **Groundwater Conservation**: By calculating precise soil moisture deficits and incorporating rainfall probability, FarmGuard helps prevent routine over-irrigation, offering potential groundwater savings of 20–30% per irrigation cycle.
2. **Agricultural Energy & Fuel Efficiency**: Reducing unneeded tubewell pumping directly conserves electricity (grid pumps consume ~3.7 kWh/hr) and diesel fuel (~1.8 L/hr), lowering agricultural emissions.
3. **Residue Management & Clean Air**: Encouraging in-situ stubble retention (mulching, bio-decomposers) over seasonal burning helps reduce $\text{CO}_2\text{e}$ and toxic $\text{PM}_{2.5}$ emissions while restoring soil organic carbon.
4. **Transparent & Safe Decision Support**: Uses transparent, verifiable mathematics rather than ungrounded AI predictions, ensuring farmers receive actionable, responsible guidance.

*(Note: Environmental impact metrics represent modeled agronomic potentials based on standard ICAR/FAO irrigation parameters; actual on-farm savings vary by soil type, weather, and management practices.)*

---

## ⚠️ Limitations & Future Scope

### Current Limitations
- AI advice provides contextual decision support and does not replace local agronomic extension experts or soil laboratory tests.
- Accurate pump running time requires an accurate water discharge measurement in L/min.
- Current prototype model focuses on four staple crops: Wheat, Rice, Maize, and Sugarcane.

### Future Roadmap
- Localized real-time mandi market prices via Agmarknet API.
- Government subsidy navigator for PM-KUSUM (solar pumps) and PMKSY schemes.
- Multilingual voice input and vernacular speech synthesis for hands-free field use.
- Direct integration with Government Soil Health Card digital records.

