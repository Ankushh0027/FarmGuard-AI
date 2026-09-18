"""Input validation guardrails for FarmGuard AI.

Validates user input fields, detects impossible agronomic bounds, and blocks malformed
payloads before reaching the calculation engine or agent.
"""

from typing import Dict, Any, Tuple, Optional, List
from app.guardrails.security import detect_prompt_injection, scan_for_secrets

SUPPORTED_CROPS = {"wheat", "rice", "maize", "sugarcane"}
SUPPORTED_SOILS = {
    "alluvial", "loam", "loamy", "sandy loam", "sandy_loam", "sandy-loam",
    "clay", "clayey", "clay loam", "clay_loam", "sand", "sandy", "black", "black soil", "red", "red soil"
}

MAX_USER_MESSAGE_LENGTH = 2000
MAX_LOCATION_LENGTH = 100
MAX_AREA_ACRES = 100000.0
MAX_IRRIGATION_MM = 1000.0
MAX_FORECAST_RAIN_MM = 2000.0


def validate_farm_input_dict(data: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict[str, str]]]:
    """Validate farm input parameters against physical/agronomic bounds.

    Returns:
        Tuple of (is_valid, error_code, field_errors_dict)
    """
    errors: Dict[str, str] = {}

    # 1. Crop validation
    if "crop" in data and data["crop"] is not None:
        crop_val = str(data["crop"]).strip().lower()
        if crop_val not in SUPPORTED_CROPS:
            errors["crop"] = f"Unsupported crop '{data['crop']}'. Supported crops: {', '.join(sorted(SUPPORTED_CROPS))}."

    # 2. Area acres validation (must be > 0 and reasonable)
    if "area_acres" in data and data["area_acres"] is not None:
        try:
            area = float(data["area_acres"])
            if area <= 0.0:
                errors["area_acres"] = "Farm area must be greater than 0 acres."
            elif area > MAX_AREA_ACRES:
                errors["area_acres"] = f"Farm area exceeds maximum supported limit of {MAX_AREA_ACRES:,.0f} acres."
        except (ValueError, TypeError):
            errors["area_acres"] = "Farm area must be a valid positive number."

    # 3. Soil type validation
    if "soil_type" in data and data["soil_type"] is not None:
        soil_val = str(data["soil_type"]).strip().lower()
        if soil_val not in SUPPORTED_SOILS:
            errors["soil_type"] = f"Unsupported soil type '{data['soil_type']}'."

    # 4. Current irrigation mm validation (>= 0)
    if "current_irrigation_mm" in data and data["current_irrigation_mm"] is not None:
        try:
            curr_mm = float(data["current_irrigation_mm"])
            if curr_mm < 0.0:
                errors["current_irrigation_mm"] = "Current irrigation depth cannot be negative."
            elif curr_mm > MAX_IRRIGATION_MM:
                errors["current_irrigation_mm"] = f"Current irrigation depth exceeds physical ceiling of {MAX_IRRIGATION_MM} mm."
        except (ValueError, TypeError):
            errors["current_irrigation_mm"] = "Current irrigation depth must be a valid non-negative number."

    # 5. Soil moisture percent validation (0 to 100%)
    if "soil_moisture_percent" in data and data["soil_moisture_percent"] is not None:
        try:
            moisture = float(data["soil_moisture_percent"])
            if moisture < 0.0 or moisture > 100.0:
                errors["soil_moisture_percent"] = "Soil moisture level must be between 0.0% and 100.0%."
        except (ValueError, TypeError):
            errors["soil_moisture_percent"] = "Soil moisture level must be a valid number between 0 and 100."

    # 6. Rainfall probability validation (0.0 to 1.0 or 0 to 100)
    if "rainfall_probability" in data and data["rainfall_probability"] is not None:
        try:
            prob = float(data["rainfall_probability"])
            if prob < 0.0 or prob > 100.0:
                errors["rainfall_probability"] = "Rainfall probability must be between 0.0 and 1.0 (or 0% to 100%)."
        except (ValueError, TypeError):
            errors["rainfall_probability"] = "Rainfall probability must be a valid numeric value."

    # 7. Forecast rainfall mm validation (if supplied, must be >= 0)
    if "forecast_rainfall_mm" in data and data["forecast_rainfall_mm"] is not None:
        try:
            fc_mm = float(data["forecast_rainfall_mm"])
            if fc_mm < 0.0:
                errors["forecast_rainfall_mm"] = "Forecast rainfall depth cannot be negative."
            elif fc_mm > MAX_FORECAST_RAIN_MM:
                errors["forecast_rainfall_mm"] = f"Forecast rainfall exceeds realistic atmospheric ceiling of {MAX_FORECAST_RAIN_MM} mm."
        except (ValueError, TypeError):
            errors["forecast_rainfall_mm"] = "Forecast rainfall depth must be a valid non-negative number."

    # 8. Location validation
    if "location" in data and data["location"] is not None:
        loc = str(data["location"]).strip()
        if len(loc) < 2:
            errors["location"] = "Location name must be at least 2 characters."
        elif len(loc) > MAX_LOCATION_LENGTH:
            errors["location"] = f"Location name exceeds maximum allowed length of {MAX_LOCATION_LENGTH} characters."

    if errors:
        return False, "invalid_farm_input_bounds", errors

    return True, None, None


def validate_user_message(message: Optional[str]) -> Tuple[bool, Optional[str]]:
    """Validate user prompt message for size, injection attacks, and secret leakage.

    Returns:
        Tuple of (is_valid, error_code)
    """
    if not message:
        return True, None

    if len(message) > MAX_USER_MESSAGE_LENGTH:
        return False, "message_length_exceeded"

    # Scan for prompt injection attempts
    is_injected, reason = detect_prompt_injection(message)
    if is_injected:
        return False, reason

    # Scan for user pasting internal secrets or keys
    has_secret, secret_type = scan_for_secrets(message)
    if has_secret:
        return False, secret_type

    return True, None
