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
)
from app.evaluation.evaluator import evaluate_response
from app.evaluation.dataset import load_evaluation_dataset
from app.evaluation.adversarial_evaluator import run_adversarial_benchmark

__all__ = [
    "evaluate_numerical_consistency",
    "evaluate_tool_groundedness",
    "evaluate_schema_validity",
    "evaluate_safety",
    "evaluate_secret_leakage",
    "evaluate_uncertainty_handling",
    "calculate_adversarial_benchmark_metrics",
    "calculate_llm_reliability_metrics",
    "evaluate_response",
    "load_evaluation_dataset",
    "run_adversarial_benchmark",
]
