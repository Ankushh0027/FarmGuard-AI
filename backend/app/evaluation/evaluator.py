"""FarmGuard AI Response Evaluator.

Executes deterministic evaluation suite on every generated agent advisory response.
"""

from typing import Dict, Any, List, Optional
from app.evaluation.metrics import (
    evaluate_numerical_consistency,
    evaluate_tool_groundedness,
    evaluate_schema_validity,
    evaluate_safety,
    evaluate_secret_leakage,
    evaluate_uncertainty_handling,
)


def evaluate_response(
    answer: str,
    tool_trace: List[Dict[str, Any]],
    numerical_results: Optional[Dict[str, Any]],
    assumptions: List[Any],
) -> Dict[str, Any]:
    """Execute complete deterministic evaluation on an agent response.

    Returns:
        Structured evaluation dictionary with overall pass/fail status and detailed metric breakdowns.
    """
    num_eval = evaluate_numerical_consistency(answer, numerical_results)
    ground_eval = evaluate_tool_groundedness(tool_trace, numerical_results)
    schema_eval = evaluate_schema_validity(answer, has_numerical_results=numerical_results is not None)
    safety_eval = evaluate_safety(answer)
    secret_eval = evaluate_secret_leakage(answer)
    uncert_eval = evaluate_uncertainty_handling(assumptions, numerical_results)

    all_passed = all([
        num_eval["status"] == "passed",
        ground_eval["status"] == "passed",
        schema_eval["status"] == "passed",
        safety_eval["status"] == "passed",
        secret_eval["status"] == "passed",
        uncert_eval["status"] == "passed",
    ])

    return {
        "overall": "passed" if all_passed else "failed",
        "numerical_consistency": num_eval["status"],
        "tool_groundedness": ground_eval["status"],
        "schema_validity": schema_eval["status"],
        "safety": safety_eval["status"],
        "secret_scan": secret_eval["status"],
        "uncertainty_handling": uncert_eval["status"],
        "details": {
            "numerical_consistency": num_eval,
            "tool_groundedness": ground_eval,
            "schema_validity": schema_eval,
            "safety": safety_eval,
            "secret_leakage": secret_eval,
            "uncertainty_handling": uncert_eval,
        }
    }
