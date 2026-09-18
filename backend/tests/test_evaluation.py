"""Comprehensive tests for FarmGuard AI LLM Evaluation Framework and Regression Dataset."""

import pytest
from unittest.mock import patch

from app.evaluation.metrics import (
    evaluate_numerical_consistency,
    evaluate_tool_groundedness,
    evaluate_schema_validity,
    evaluate_safety,
    evaluate_secret_leakage,
    evaluate_uncertainty_handling,
)
from app.evaluation.evaluator import evaluate_response
from app.evaluation.dataset import load_evaluation_dataset
from app.agents.farm_agent import FarmGuardAgent
from app.models.farm import AgentAdviceRequest


# ============================================================================
# 1. EVALUATION METRICS UNIT TESTS
# ============================================================================

def test_evaluate_numerical_consistency_pass_and_fail():
    """Test evaluate_numerical_consistency on matching vs hallucinated text."""
    tools_out = {
        "irrigation_recommendation": {"recommended_irrigation_mm": 15.0},
        "residue_estimate": {"estimated_residue_tonnes": 3.8},
        "environmental_impact": {"co2e_avoided_kg": 5548.0},
    }

    good_text = "RECOMMENDATION: Apply 15.0 mm depth. CROP RESIDUE: 3.8 tonnes. CO2e avoided: 5,548 kg."
    good_res = evaluate_numerical_consistency(good_text, tools_out)
    assert good_res["status"] == "passed"
    assert good_res["score"] == 1.0

    bad_text = "RECOMMENDATION: Apply 45.0 mm depth."
    bad_res = evaluate_numerical_consistency(bad_text, tools_out)
    assert bad_res["status"] == "failed"
    assert bad_res["score"] == 0.0


def test_evaluate_tool_groundedness_missing_tools():
    """Test tool groundedness metric detects missing required deterministic tools."""
    partial_trace = [
        {"tool": "get_crop_water_requirement"},
        {"tool": "calculate_irrigation"},
        # missing water_savings, residue, env_impact
    ]
    eval_res = evaluate_tool_groundedness(partial_trace, numerical_results={"some": "data"})
    assert eval_res["status"] == "failed"
    assert "Missing required deterministic tools" in eval_res["reason"]


def test_evaluate_safety_certainty_violation():
    """Test safety metric catches unconditional promises."""
    unsafe_text = "You definitely do not need irrigation under any condition."
    eval_res = evaluate_safety(unsafe_text)
    assert eval_res["status"] == "failed"
    assert eval_res["score"] == 0.0


def test_evaluate_secret_leakage():
    """Test secret leakage evaluation catches exposed keys."""
    clean_text = "Everything is safe."
    assert evaluate_secret_leakage(clean_text)["status"] == "passed"

    leaked_text = "Here is my secret GEMINI_API_KEY."
    assert evaluate_secret_leakage(leaked_text)["status"] == "failed"


# ============================================================================
# 2. EVALUATION DATASET REGRESSION TESTS (32 Cases)
# ============================================================================

def test_load_evaluation_dataset():
    """Verify eval_cases.json loads at least 30 test cases with valid structure."""
    cases = load_evaluation_dataset()
    assert len(cases) >= 30
    for case in cases:
        assert "id" in case
        assert "name" in case
        assert "request" in case
        assert "expected" in case


def test_regression_dataset_execution():
    """Execute all regression dataset cases against FarmGuardAgent and verify expected security & evaluation outcomes."""
    cases = load_evaluation_dataset()
    agent = FarmGuardAgent()

    for case in cases:
        req_dict = case["request"]
        exp = case["expected"]

        # Run mock weather where needed to avoid network latency during unit test batch
        with patch("app.services.weather_service.fetch_weather_forecast") as mock_weather:
            if case.get("type") == "external_service_resilience":
                mock_weather.return_value = {
                    "location": req_dict.get("farm", {}).get("location", "Unknown"),
                    "status": "unavailable",
                    "forecast_rainfall_mm": None,
                    "rainfall_probability": None,
                    "source": "Open-Meteo"
                }
            else:
                mock_weather.return_value = {
                    "location": "Uttar Pradesh",
                    "status": "available",
                    "forecast_rainfall_mm": req_dict.get("farm", {}).get("forecast_rainfall_mm", 5.0) if req_dict.get("farm") else 5.0,
                    "rainfall_probability": 0.50,
                    "source": "Open-Meteo"
                }

            req = AgentAdviceRequest(
                message=req_dict.get("message"),
                farm=req_dict.get("farm")
            )
            response = agent.get_advice(req)

            # Check blocked expectations
            if exp.get("blocked") is True:
                assert response.blocked is True, f"Case {case['id']} expected blocked=True"
                if exp.get("reason"):
                    assert response.block_reason == exp["reason"], f"Case {case['id']} expected reason {exp['reason']}"
            elif exp.get("blocked") is False:
                assert response.blocked is False, f"Case {case['id']} expected blocked=False"

            # Check missing fields expectations
            if "missing_fields" in exp:
                assert response.missing_fields is not None, f"Case {case['id']} expected missing fields"

            # Check overall evaluation expectations
            if exp.get("eval_overall") == "passed":
                assert response.evaluation is not None
                assert response.evaluation.get("overall") == "passed", f"Case {case['id']} evaluation overall failed: {response.evaluation}"
