"""Evaluation dataset runner and validation utilities for regression testing."""

import json
import os
from typing import List, Dict, Any, Optional

DEFAULT_DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "tests", "eval_cases.json"
)


def load_evaluation_dataset(filepath: Optional[str] = None) -> List[Dict[str, Any]]:
    """Load evaluation test cases from JSON dataset."""
    path = filepath or DEFAULT_DATASET_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Evaluation dataset not found at {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(f"Evaluation dataset at {path} must be a JSON list of cases.")

    return data
