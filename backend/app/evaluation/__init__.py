"""FarmGuard AI LLM Evaluation Framework."""

from app.evaluation.metrics import (
    evaluate_numerical_consistency,
    evaluate_tool_groundedness,
    evaluate_schema_validity,
    evaluate_safety,
    evaluate_secret_leakage,
    evaluate_uncertainty_handling,
    calculate_adversarial_benchmark_metrics,
    calculate_llm_reliability_metrics,
    calculate_agent_benchmark_metrics,
)
from app.evaluation.evaluator import evaluate_response
from app.evaluation.dataset import load_evaluation_dataset
def run_adversarial_benchmark(*args, **kwargs):
    from app.evaluation.adversarial_evaluator import run_adversarial_benchmark as _run
    return _run(*args, **kwargs)


def run_agent_evaluation(*args, **kwargs):
    from app.evaluation.agent_evaluator import run_agent_evaluation as _run
    return _run(*args, **kwargs)


__all__ = [
    "evaluate_numerical_consistency",
    "evaluate_tool_groundedness",
    "evaluate_schema_validity",
    "evaluate_safety",
    "evaluate_secret_leakage",
    "evaluate_uncertainty_handling",
    "calculate_adversarial_benchmark_metrics",
    "calculate_llm_reliability_metrics",
    "calculate_agent_benchmark_metrics",
    "evaluate_response",
    "load_evaluation_dataset",
    "run_adversarial_benchmark",
    "run_agent_evaluation",
]
