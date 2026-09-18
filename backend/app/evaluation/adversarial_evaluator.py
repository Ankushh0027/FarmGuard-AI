"""Adversarial Security Evaluator and Benchmark Runner for FarmGuard AI.

Loads the comprehensive adversarial dataset, executes defense-in-depth security checks,
measures empirical attack detection, block rates, false positive rates on benign controls,
and calculates quantitative reliability metrics.
"""

import json
import os
import math
from typing import Dict, Any, List, Optional
from unittest.mock import patch

from app.models.farm import AgentAdviceRequest
from app.agents.farm_agent import FarmGuardAgent
from app.guardrails.security import detect_prompt_injection, scan_for_secrets
from app.guardrails.tool_guardrails import authorize_tool, validate_tool_inputs, validate_tool_outputs
from app.guardrails.output_guardrails import validate_agent_output
from app.evaluation.metrics import (
    calculate_adversarial_benchmark_metrics,
    calculate_llm_reliability_metrics,
)

DEFAULT_ADVERSARIAL_DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "tests", "adversarial_cases.json"
)


def run_adversarial_benchmark(
    dataset_path: Optional[str] = None,
    mock_weather: bool = True
) -> Dict[str, Any]:
    """Execute complete adversarial security benchmark across all dataset cases.

    Args:
        dataset_path: Path to adversarial_cases.json.
        mock_weather: If True, uses offline mock weather to ensure deterministic benchmark speed.

    Returns:
        Structured benchmark report containing aggregate metrics, category breakdowns, and case outcomes.
    """
    path = dataset_path or DEFAULT_ADVERSARIAL_DATASET_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Adversarial dataset not found at {path}")

    with open(path, "r", encoding="utf-8") as f:
        cases: List[Dict[str, Any]] = json.load(f)

    agent = FarmGuardAgent()
    case_results: List[Dict[str, Any]] = []
    llm_events: List[Dict[str, Any]] = []

    for case in cases:
        case_id = case["id"]
        cat = case.get("category", "unknown")
        is_benign = case.get("is_benign", False)
        msg = case.get("message")
        farm_dict = case.get("farm")
        tool_call = case.get("tool_call")
        mock_output = case.get("mock_output")
        mock_llm = case.get("mock_llm")
        num_res = case.get("numerical_results")

        outcome: Dict[str, Any] = {
            "case_id": case_id,
            "category": cat,
            "is_benign": is_benign,
            "detected": False,
            "blocked": False,
            "secret_leaked": False,
            "unauthorized_tool_executed": False,
            "tool_argument_violation": False,
            "fallback_triggered": False,
            "fallback_successful": False,
            "safe_handling": False,
        }

        # Case Type 1: Direct Tool Abuse Invocations
        if tool_call:
            auth_ok, _ = authorize_tool(tool_call)
            if not auth_ok:
                outcome["detected"] = True
                outcome["blocked"] = True
                outcome["unauthorized_tool_executed"] = False
                outcome["safe_handling"] = True
            else:
                args = case.get("args", {})
                inp_ok, _ = validate_tool_inputs(tool_call, args)
                if not inp_ok:
                    outcome["detected"] = True
                    outcome["blocked"] = True
                    outcome["tool_argument_violation"] = True
                    outcome["safe_handling"] = True
                elif mock_output is not None:
                    out_ok, _ = validate_tool_outputs(tool_call, mock_output)
                    if not out_ok:
                        outcome["detected"] = True
                        outcome["blocked"] = True
                        outcome["safe_handling"] = True

        # Case Type 2: Direct LLM Output Safety & Grounding Verification
        elif mock_llm is not None:
            out_ok, status, reason = validate_agent_output(mock_llm, num_res)
            llm_events.append({
                "failed": not out_ok,
                "malformed": "missing_required_section" in (reason or ""),
                "numerical_mismatch": "Numerical grounding mismatch" in (reason or ""),
            })
            if not out_ok:
                outcome["detected"] = True
                outcome["fallback_triggered"] = True
                outcome["fallback_successful"] = True
                outcome["safe_handling"] = True
                outcome["blocked"] = False  # Soft fallback rather than hard refusal
            else:
                outcome["safe_handling"] = True

        # Case Type 3: End-to-End Agent Query Processing
        else:
            with patch("app.agents.farm_agent.get_weather_forecast") as mock_wf:
                mock_wf.return_value = {
                    "location": "Uttar Pradesh",
                    "status": "available",
                    "forecast_rainfall_mm": 5.0,
                    "rainfall_probability": 0.50,
                    "source": "Open-Meteo"
                }

                req = AgentAdviceRequest(message=msg, farm=farm_dict, fetch_weather=False)
                res = agent.get_advice(req)

                if res.blocked:
                    outcome["blocked"] = True
                    outcome["detected"] = True
                    outcome["safe_handling"] = True
                else:
                    outcome["safe_handling"] = True

                # Check secret leakage
                res_str = str(res.model_dump())
                has_secret, _ = scan_for_secrets(res_str)
                if has_secret:
                    outcome["secret_leaked"] = True
                    outcome["safe_handling"] = False

        case_results.append(outcome)

    # Compute aggregate benchmark metrics
    security_metrics = calculate_adversarial_benchmark_metrics(case_results)
    reliability_metrics = calculate_llm_reliability_metrics(llm_events)

    report = {
        "benchmark_summary": security_metrics,
        "reliability_summary": reliability_metrics,
        "category_breakdown": _compute_category_breakdown(case_results),
        "case_results": case_results,
        "total_cases_evaluated": len(case_results),
    }

    return report


def _compute_category_breakdown(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute per-category detection and block statistics."""
    categories: Dict[str, Dict[str, int]] = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = {"total": 0, "detected": 0, "blocked": 0, "safe": 0}
        categories[cat]["total"] += 1
        if r["detected"]:
            categories[cat]["detected"] += 1
        if r["blocked"]:
            categories[cat]["blocked"] += 1
        if r["safe_handling"]:
            categories[cat]["safe"] += 1
    return categories


if __name__ == "__main__":
    report = run_adversarial_benchmark()
    print(json.dumps(report, indent=2))
