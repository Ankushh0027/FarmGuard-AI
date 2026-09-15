"""Agent-callable tool interfaces for FarmGuard AI.

These tool functions serve as the standard interface for AI agent orchestration
(such as Google Gemini function calling in future phases). All numerical
calculations, unit conversions, and agronomic logic are strictly delegated to
the deterministic calculation engine in `app.calculations.farm_calculator`.
"""

from typing import Dict, Any, Optional
from app.models.farm import FarmInput
from app.calculations.farm_calculator import (
    get_crop_water_requirement as _calc_get_crop_water_requirement,
    calculate_irrigation as _calc_calculate_irrigation,
    calculate_water_savings as _calc_calculate_water_savings,
    calculate_crop_residue as _calc_calculate_crop_residue,
    calculate_environmental_impact as _calc_calculate_environmental_impact,
    analyze_farm as _calc_analyze_farm,
)


def get_crop_water_requirement(
    crop: str,
    soil_type: Optional[str] = "alluvial"
) -> Dict[str, Any]:
    """Retrieve baseline crop water requirements, target moisture threshold, and soil retention characteristics.

    Args:
        crop: Crop name (supported: 'wheat', 'rice', 'maize', 'sugarcane').
        soil_type: Soil texture type (e.g. 'alluvial', 'loamy', 'sandy loam', 'clayey', 'sandy', 'black', 'red').

    Returns:
        Dictionary with crop baseline depth (mm), target moisture %, critical moisture %,
        soil retention factor, adjusted depth (mm), and descriptive guidance.
    """
    result = _calc_get_crop_water_requirement(crop=crop, soil_type=soil_type)
    return result.model_dump()


def calculate_irrigation(
    crop: str,
    area_acres: float,
    soil_type: str,
    current_irrigation_mm: float,
    location: str,
    rainfall_probability: float,
    soil_moisture_percent: float,
) -> Dict[str, Any]:
    """Calculate the precise recommended irrigation depth (mm), operational urgency, and tactical guidance.

    Args:
        crop: Crop name ('wheat', 'rice', 'maize', 'sugarcane').
        area_acres: Field size in acres (> 0).
        soil_type: Soil texture ('alluvial', 'loamy', 'sandy loam', 'clayey', 'sandy', 'black', 'red').
        current_irrigation_mm: Current farmer scheduled water application depth in mm (>= 0).
        location: Indian state or region (e.g. 'Uttar Pradesh', 'Punjab').
        rainfall_probability: Forecast precipitation probability in next 24-48 hours (0.0 to 1.0 or 0 to 100%).
        soil_moisture_percent: Current soil moisture level (0.0 to 100.0%).

    Returns:
        Dictionary containing recommended_irrigation_mm, status, urgency, action,
        soil_depletion_percent, expected_rain_offset_mm, and clear explanation.
    """
    farm_input = FarmInput(
        crop=crop,
        area_acres=area_acres,
        soil_type=soil_type,
        current_irrigation_mm=current_irrigation_mm,
        location=location,
        rainfall_probability=rainfall_probability,
        soil_moisture_percent=soil_moisture_percent,
    )
    result = _calc_calculate_irrigation(farm_input)
    return result.model_dump()


def calculate_water_savings(
    crop: str,
    area_acres: float,
    soil_type: str,
    current_irrigation_mm: float,
    recommended_irrigation_mm: float,
    location: str = "Uttar Pradesh",
    rainfall_probability: float = 0.0,
    soil_moisture_percent: float = 50.0,
) -> Dict[str, Any]:
    """Quantify water application volumes in liters, water saved, and tubewell electricity/diesel hours saved.

    Args:
        crop: Crop name.
        area_acres: Field size in acres (> 0).
        soil_type: Soil texture.
        current_irrigation_mm: Farmer's current or scheduled water application in mm (>= 0).
        recommended_irrigation_mm: System recommended water application depth in mm (>= 0).
        location: Region (default: 'Uttar Pradesh').
        rainfall_probability: Rain forecast (default: 0.0).
        soil_moisture_percent: Soil moisture percent (default: 50.0).

    Returns:
        Dictionary containing current_water_liters, recommended_water_liters,
        water_savings_liters (guaranteed >= 0), water_savings_percent, and diesel_or_electricity_savings_hours.
    """
    farm_input = FarmInput(
        crop=crop,
        area_acres=area_acres,
        soil_type=soil_type,
        current_irrigation_mm=current_irrigation_mm,
        location=location,
        rainfall_probability=rainfall_probability,
        soil_moisture_percent=soil_moisture_percent,
    )
    result = _calc_calculate_water_savings(farm_input, recommended_mm=recommended_irrigation_mm)
    return result.model_dump()


def calculate_crop_residue(
    crop: str,
    area_acres: float,
    soil_type: str = "alluvial",
    current_irrigation_mm: float = 50.0,
    location: str = "Uttar Pradesh",
    rainfall_probability: float = 0.0,
    soil_moisture_percent: float = 50.0,
) -> Dict[str, Any]:
    """Estimate total crop stubble/biomass generated, burning risk level, and eco-friendly management solutions.

    Args:
        crop: Crop name ('wheat', 'rice', 'maize', 'sugarcane').
        area_acres: Field size in acres (> 0).
        soil_type: Soil texture (default: 'alluvial').
        current_irrigation_mm: Water depth (default: 50.0).
        location: Region (default: 'Uttar Pradesh').
        rainfall_probability: Rain forecast (default: 0.0).
        soil_moisture_percent: Soil moisture percent (default: 50.0).

    Returns:
        Dictionary with crop, area_acres, estimated_residue_tonnes, stubble_burning_risk,
        recommended_practices, and economic_potential_inr.
    """
    farm_input = FarmInput(
        crop=crop,
        area_acres=area_acres,
        soil_type=soil_type,
        current_irrigation_mm=current_irrigation_mm,
        location=location,
        rainfall_probability=rainfall_probability,
        soil_moisture_percent=soil_moisture_percent,
    )
    result = _calc_calculate_crop_residue(farm_input)
    return result.model_dump()


def calculate_environmental_impact(
    crop: str,
    area_acres: float,
    current_irrigation_mm: float = 50.0,
    recommended_irrigation_mm: float = 20.0,
    soil_type: str = "alluvial",
    location: str = "Uttar Pradesh",
    rainfall_probability: float = 0.0,
    soil_moisture_percent: float = 50.0,
) -> Dict[str, Any]:
    """Calculate environmental benefits including CO2e emissions avoided, PM2.5 avoided, and water saved.

    Args:
        crop: Crop name.
        area_acres: Field size in acres (> 0).
        current_irrigation_mm: Current scheduled water depth (mm).
        recommended_irrigation_mm: Recommended water depth (mm).
        soil_type: Soil texture.
        location: Region.
        rainfall_probability: Rain forecast.
        soil_moisture_percent: Soil moisture.

    Returns:
        Dictionary with co2e_avoided_kg, pm25_avoided_kg, water_saved_liters,
        water_saved_cubic_meters, and soil_health_benefit.
    """
    farm_input = FarmInput(
        crop=crop,
        area_acres=area_acres,
        soil_type=soil_type,
        current_irrigation_mm=current_irrigation_mm,
        location=location,
        rainfall_probability=rainfall_probability,
        soil_moisture_percent=soil_moisture_percent,
    )
    water_analysis = _calc_calculate_water_savings(farm_input, recommended_mm=recommended_irrigation_mm)
    residue_estimate = _calc_calculate_crop_residue(farm_input)
    result = _calc_calculate_environmental_impact(farm_input, water_analysis, residue_estimate)
    return result.model_dump()


def analyze_farm_pipeline(
    crop: str,
    area_acres: float,
    soil_type: str,
    current_irrigation_mm: float,
    location: str,
    rainfall_probability: float,
    soil_moisture_percent: float,
) -> Dict[str, Any]:
    """Execute the complete deterministic farm analysis pipeline (convenience orchestration tool).

    Args:
        crop: Crop name.
        area_acres: Field size in acres (> 0).
        soil_type: Soil texture.
        current_irrigation_mm: Current scheduled water depth (mm).
        location: Region.
        rainfall_probability: Rain forecast (0.0-1.0 or 0-100%).
        soil_moisture_percent: Soil moisture (0-100%).

    Returns:
        Dictionary with complete aggregated farm analysis response.
    """
    farm_input = FarmInput(
        crop=crop,
        area_acres=area_acres,
        soil_type=soil_type,
        current_irrigation_mm=current_irrigation_mm,
        location=location,
        rainfall_probability=rainfall_probability,
        soil_moisture_percent=soil_moisture_percent,
    )
    result = _calc_analyze_farm(farm_input)
    return result.model_dump()
