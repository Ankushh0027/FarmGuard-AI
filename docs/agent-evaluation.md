# FarmGuard AI — Agent Evaluation & Behavioral Report 🌾

## 1. Benchmark Overview

- **Total Cases Evaluated**: 52
- **Agent Behavioral Categories**: 7
  1. **Irrigation Scenarios (12 cases)**: Diverse crops (wheat, rice, maize, sugarcane), multiple soil profiles (sandy loam, clayey, loamy, black, red, alluvial), variable moisture levels, and diverse farm scales (0.5 acre to 25 acres).
  2. **Missing Information & Clarification (8 cases)**: Queries omitting key parameters (crop, area, soil type, moisture, location), validating that the agent requests clarification without executing calculation tools prematurely.
  3. **Boundary Conditions (8 cases)**: Extreme saturation ($100\%$), severe bone-dry soil ($0\%$), micro-acreage ($0.1\text{ acre}$), large estates ($100\text{ acres}$), and heavy torrential forecasts ($120\text{ mm}$).
  4. **Tool Grounding (6 cases)**: Strict verification that all numerical claims (irrigation depths, water savings liters, stubble tonnes, pump hours, CO2e) match pure Python deterministic calculations.
  5. **Semantic Relevance (6 cases)**: Assessment of domain alignment regarding sustainable agricultural practices (in-situ mulching, Happy Seeder, Pusa bio-decomposer, soil organic carbon).
  6. **Uncertainty & Fault-Tolerance (6 cases)**: Rainfall probability vs depth separation, weather API outages, prototype model disclaimers, and transparent fallback activations.
  7. **Red-Team Tool Security (6 cases)**: Indirect prompt injection in location/weather payloads, `NaN`/`Infinity` tool arguments, unauthorized tool calls, forged negative tool outputs, and secret exfiltration defense.

---

## 2. Agent Behavioral Metrics

| Metric | Measured Result | Description |
|---|---:|:---|
| **Tool Selection Accuracy** | **100.00%** | Fraction of cases where precisely the required tool set was invoked. |
| **Tool Sequence Correctness** | **100.00%** | Adherence to causal execution order (`crop_water` $\to$ `irrigation` $\to$ `water_savings` $\to$ `crop_residue` $\to$ `environmental_impact`). |
| **Numerical Grounding Faithfulness** | **97.50%** | Proportion of grounded outputs matching pure tool math ($\le 5\%$ tolerance; 1 detected mismatch in adversarial red-team case). |
| **Semantic Relevance Rate** | **94.23%** | Alignment with user crop, soil, weather, and agricultural advisory intent. |
| **Trace Integrity Rate** | **100.00%** | Complete, uncorrupted event sequences with valid tool metadata and zero secret leakage. |
| **Red-Team Tool Attack Resistance** | **100.00%** | Successful rejection/mitigation of forged tool outputs, `NaN` inputs, and indirect injection. |

---

## 3. Latency & Performance Profile

Benchmark executed in deterministic offline mode across 52 requests:

| Percentile / Stat | Latency (ms) | Target SLA | Status |
|:---|---:|---:|:---:|
| **Minimum** | 0.00 ms | $< 10\text{ ms}$ | ✅ |
| **Mean** | 2.66 ms | $< 50\text{ ms}$ | ✅ |
| **Median (p50)** | 3.08 ms | $< 50\text{ ms}$ | ✅ |
| **90th Percentile (p90)** | 4.34 ms | $< 100\text{ ms}$ | ✅ |
| **95th Percentile (p95)** | 4.59 ms | $< 150\text{ ms}$ | ✅ |
| **Maximum** | 5.21 ms | $< 250\text{ ms}$ | ✅ |

---

## 4. Category-by-Category Breakdown

| Category | Cases | Tool Selection | Sequence Correctness | Grounding Faithfulness | Semantic Relevance | Trace Integrity |
|:---|---:|---:|---:|---:|---:|---:|
| **Irrigation** | 12 | 12 / 12 (100%) | 12 / 12 (100%) | 12 / 12 (100%) | 12 / 12 (100%) | 12 / 12 (100%) |
| **Missing Information** | 8 | 8 / 8 (100%) | N/A (0 tools) | N/A (0 tools) | 8 / 8 (100%) | 8 / 8 (100%) |
| **Boundary Conditions** | 8 | 8 / 8 (100%) | 8 / 8 (100%) | 8 / 8 (100%) | 7 / 8 (87.5%) | 8 / 8 (100%) |
| **Tool Grounding** | 6 | 6 / 6 (100%) | 6 / 6 (100%) | 6 / 6 (100%) | 6 / 6 (100%) | 6 / 6 (100%) |
| **Semantic Relevance** | 6 | 6 / 6 (100%) | 6 / 6 (100%) | 6 / 6 (100%) | 5 / 6 (83.3%) | 6 / 6 (100%) |
| **Uncertainty** | 6 | 6 / 6 (100%) | 6 / 6 (100%) | 6 / 6 (100%) | 5 / 6 (83.3%) | 6 / 6 (100%) |
| **Red-Team Security** | 6 | 6 / 6 (100%) | 1 / 1 (100%) | 1 / 2 (50.0%)* | 6 / 6 (100%) | 6 / 6 (100%) |

*\*In the Red-Team suite, 1 case deliberately simulates an altered LLM output, triggering intentional numerical grounding detection and safe fallback activation.*

---

## 5. Architectural Quality Insights

1. **Strict Causal Sequencing**: The agent coordinator enforces mathematical prerequisites: weather and crop water demand must be resolved before computing net deficit; net deficit must be computed before calculating water savings and pump hours.
2. **Zero Premature Invocations**: When user input lacks necessary parameters, the agent avoids invoking calculation tools with dummy defaults, instead requesting the specific missing fields.
3. **Defense Against Indirect Prompt Injection**: Injections embedded inside external data payloads (e.g., location names containing system override directives) are treated as opaque data strings and cannot hijack execution flow or exfiltrate credentials.
4. **Deterministic Fallback Reliability**: When candidate text exhibits numerical divergence or missing sections, the system deterministically falls back to structured template synthesis with zero downtime.
