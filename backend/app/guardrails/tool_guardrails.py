"""Tool execution guardrails for FarmGuard AI.

Enforces strict tool whitelisting, input schema authorization, and post-execution output
validation (forbids NaN, Infinity, negative volumes, and corrupted schemas).
"""

import math
from typing import Dict, Any, Tuple, Optional, Set, List
from app.guardrails.security import scan_for_secrets

# Whitelist of strictly authorized deterministic tools
AUTHORIZED_TOOLS: Set[str] = {
    "get_weather_forecast",
    "get_crop_water_requirement",
    "calculate_irrigation",
    "calculate_water_savings",
    "calculate_crop_residue",
    "calculate_environmental_impact",
}


def authorize_tool(tool_name: str) -> Tuple[bool, Optional[str]]:
    """Verify that the requested tool is authorized within the system registry.

    Returns:
        Tuple of (is_authorized, error_reason)
    """
    if tool_name not in AUTHORIZED_TOOLS:
        return False, f"Unauthorized or unknown tool '{tool_name}'. Allowed tools: {', '.join(sorted(AUTHORIZED_TOOLS))}."
    return True, None


def validate_tool_inputs(tool_name: str, kwargs: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validate tool arguments prior to tool execution."""
    auth_ok, auth_err = authorize_tool(tool_name)
    if not auth_ok:
        return False, auth_err

    # Check for NaN / Infinity in float inputs
    for key, val in kwargs.items():
        if isinstance(val, (int, float)):
            if math.isnan(val) or math.isinf(val):
                return False, f"Invalid float value ({val}) for parameter '{key}' in tool '{tool_name}'."

    return True, None


def _check_numeric_sanity(data: Any, path: str = "") -> Tuple[bool, Optional[str]]:
    """Recursively check that all numeric outputs are finite and sane."""
    if isinstance(data, dict):
        for k, v in data.items():
            curr_path = f"{path}.{k}" if path else k
            ok, err = _check_numeric_sanity(v, curr_path)
            if not ok:
                return False, err
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            curr_path = f"{path}[{idx}]"
            ok, err = _check_numeric_sanity(item, curr_path)
            if not ok:
                return False, err
    elif isinstance(data, (int, float)):
        if math.isnan(data) or math.isinf(data):
            return False, f"Numeric value at '{path}' is NaN or Infinity."
    return True, None


def validate_tool_outputs(tool_name: str, result: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validate tool output structure and values after execution.

    Enforces:
    - Finite numerical values (no NaN / Inf)
    - Non-negative physical quantities (water liters, residue tonnes, avoided CO2e)
    - Valid percentage bounds (0 - 100%)
    - No leaked credentials in tool output
    """
    if not isinstance(result, dict):
        return False, f"Tool '{tool_name}' returned non-dictionary output."

    # 1. Sanity check for NaN / Inf
    ok_num, err_num = _check_numeric_sanity(result)
    if not ok_num:
        return False, err_num

    # 2. Check for secret leakage in string outputs
    res_str = str(result)
    has_secret, secret_type = scan_for_secrets(res_str)
    if has_secret:
        return False, f"Tool '{tool_name}' output contained sensitive data ({secret_type})."

    # 3. Tool-specific domain validation
    if tool_name == "calculate_irrigation":
        rec_mm = result.get("recommended_irrigation_mm")
        if rec_mm is not None and rec_mm < 0.0:
            return False, f"Tool '{tool_name}' produced negative recommended irrigation ({rec_mm} mm)."

    elif tool_name == "calculate_water_savings":
        savings_l = result.get("water_savings_liters")
        curr_l = result.get("current_water_liters")
        rec_l = result.get("recommended_water_liters")
        pct = result.get("water_savings_percent")

        if savings_l is not None and savings_l < 0.0:
            return False, f"Water savings liters cannot be negative ({savings_l})."
        if curr_l is not None and curr_l < 0.0:
            return False, f"Current water liters cannot be negative ({curr_l})."
        if rec_l is not None and rec_l < 0.0:
            return False, f"Recommended water liters cannot be negative ({rec_l})."
        if pct is not None and (pct < 0.0 or pct > 100.0):
            return False, f"Water savings percent must be 0-100% ({pct})."

    elif tool_name == "calculate_crop_residue":
        tonnes = result.get("estimated_residue_tonnes")
        val = result.get("economic_potential_inr")
        if tonnes is not None and tonnes < 0.0:
            return False, f"Residue tonnes cannot be negative ({tonnes})."
        if val is not None and val < 0.0:
            return False, f"Residue economic potential cannot be negative ({val})."

    elif tool_name == "calculate_environmental_impact":
        co2e = result.get("co2e_avoided_kg")
        pm25 = result.get("pm25_avoided_kg")
        if co2e is not None and co2e < 0.0:
            return False, f"CO2e avoided cannot be negative ({co2e})."
        if pm25 is not None and pm25 < 0.0:
            return False, f"PM2.5 avoided cannot be negative ({pm25})."

    return True, None
