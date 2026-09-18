"""Output safety guardrails and numerical grounding for FarmGuard AI.

Inspects generated natural language text for numerical consistency against verified tool
results, flags unsupported certainty, prevents secret/prompt leakage, and triggers safe
deterministic fallback when deviations or hallucinations are detected.
"""

import re
from typing import Dict, Any, Tuple, Optional, List
from app.guardrails.security import scan_for_secrets

# Patterns for unsupported certainty and absolute claims
UNSUPPORTED_CERTAINTY_PATTERNS = [
    re.compile(r"(?i)\byou\s+(?:definitely|certainly|absolutely)\s+do\s*not\s+need\s+irrigation"),
    re.compile(r"(?i)\b100%\s+guaranteed"),
    re.compile(r"(?i)\bguaranteed\s+to\s+save"),
    re.compile(r"(?i)\b100%\s+safe\b"),
    re.compile(r"(?i)\bcompletely\s+eliminate\s+all\s+risk"),
]

# Patterns for unsupported authority claims
UNSUPPORTED_AUTHORITY_PATTERNS = [
    re.compile(r"(?i)\bstandardized\s+icar\s*(?:&|and)\s*pau\s+guidelines"),
    re.compile(r"(?i)\bofficial\s+icar\s+mandate"),
]

# Required section headers for structured synthesis
REQUIRED_SECTIONS = [
    "RECOMMENDATION",
    "WATER IMPACT",
    "CROP RESIDUE",
    "ENVIRONMENTAL IMPACT",
]


def check_numerical_grounding(
    text: str,
    numerical_results: Dict[str, Any],
    tolerance_rel: float = 0.05
) -> Tuple[bool, Optional[str]]:
    """Validate that key numbers cited in LLM text match verified tool calculations.

    Args:
        text: Synthesized text response from LLM.
        numerical_results: Ground truth dictionary from deterministic tools.
        tolerance_rel: Relative tolerance for floating point rounding (default 5%).

    Returns:
        Tuple of (is_grounded, failure_reason)
    """
    if not text or not numerical_results:
        return True, None

    irrig = numerical_results.get("irrigation_recommendation", {})
    water = numerical_results.get("water_analysis", {})
    residue = numerical_results.get("residue_estimate", {})
    env = numerical_results.get("environmental_impact", {})

    # 1. Verify Recommended Irrigation Depth (mm)
    rec_mm = irrig.get("recommended_irrigation_mm")
    if rec_mm is not None:
        # Search for patterns like "Apply X mm", "Recommendation: X mm", "0.0 mm"
        m_depth = re.search(r"(?i)(?:recommendation|apply|recommended|depth)[:\s*]+(\d+(?:\.\d+)?)\s*mm", text)
        if m_depth:
            claimed_depth = float(m_depth.group(1))
            diff = abs(claimed_depth - rec_mm)
            if diff > 0.5 and (rec_mm == 0 or (diff / rec_mm) > tolerance_rel):
                return False, f"Numerical grounding mismatch: claimed irrigation depth {claimed_depth} mm vs tool result {rec_mm} mm."

    # 2. Verify Residue Tonnes
    res_tonnes = residue.get("estimated_residue_tonnes")
    if res_tonnes is not None:
        m_res = re.search(r"(?i)(?:residue|stubble)[:\s*]+(\d+(?:\.\d+)?)\s*(?:tonnes|tons)", text)
        if m_res:
            claimed_tonnes = float(m_res.group(1))
            diff = abs(claimed_tonnes - res_tonnes)
            if diff > 0.3 and (diff / res_tonnes) > tolerance_rel:
                return False, f"Numerical grounding mismatch: claimed residue {claimed_tonnes} tonnes vs tool result {res_tonnes} tonnes."

    # 3. Verify CO2e Avoided (kg)
    co2e_kg = env.get("co2e_avoided_kg")
    if co2e_kg is not None:
        m_co2 = re.search(r"(?i)(?:co2e|co2)\s*(?:avoided|emissions)?[:\s*]+([0-9,]+(?:\.\d+)?)\s*kg", text)
        if m_co2:
            claimed_co2 = float(m_co2.group(1).replace(",", ""))
            diff = abs(claimed_co2 - co2e_kg)
            if diff > 10.0 and (diff / co2e_kg) > tolerance_rel:
                return False, f"Numerical grounding mismatch: claimed CO2e {claimed_co2} kg vs tool result {co2e_kg} kg."

    return True, None


def check_unsupported_certainty(text: str) -> Tuple[bool, Optional[str]]:
    """Check text for ungrounded certainty or absolute agricultural claims."""
    if not text:
        return True, None

    for pattern in UNSUPPORTED_CERTAINTY_PATTERNS:
        if pattern.search(text):
            return False, "unsupported_certainty_detected"

    for pattern in UNSUPPORTED_AUTHORITY_PATTERNS:
        if pattern.search(text):
            return False, "unsupported_authority_claim_detected"

    return True, None


def check_output_structure(text: str) -> Tuple[bool, Optional[str]]:
    """Check that required structured sections exist in response."""
    if not text:
        return False, "empty_output"

    for section in REQUIRED_SECTIONS:
        if section not in text.upper():
            return False, f"missing_required_section_{section.lower().replace(' ', '_')}"

    return True, None


def validate_agent_output(
    text: str,
    numerical_results: Optional[Dict[str, Any]] = None
) -> Tuple[bool, str, Optional[str]]:
    """Execute complete output safety pipeline on synthesized LLM answer.

    Returns:
        Tuple of (is_safe, check_status, failure_reason)
    """
    if not text:
        return False, "failed", "empty_response"

    # 1. Secret / Credential Leakage Scan
    has_secret, secret_type = scan_for_secrets(text)
    if has_secret:
        return False, "failed", f"secret_leak_detected_{secret_type}"

    # 2. Unsupported Certainty & Authority Claims
    cert_ok, cert_err = check_unsupported_certainty(text)
    if not cert_ok:
        return False, "failed", cert_err

    # 3. Structure & Section Verification
    struct_ok, struct_err = check_output_structure(text)
    if not struct_ok:
        return False, "failed", struct_err

    # 4. Numerical Grounding Verification
    if numerical_results:
        ground_ok, ground_err = check_numerical_grounding(text, numerical_results)
        if not ground_ok:
            return False, "failed", ground_err

    return True, "passed", None
