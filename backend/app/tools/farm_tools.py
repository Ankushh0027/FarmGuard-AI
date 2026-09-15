"""Tool interface wrappers for FarmGuard AI.

These functions provide schema-compatible tools designed for Gemini tool calling
in subsequent phases while delegating 100% of numerical calculations to the
deterministic calculation engine.
"""

from typing import Dict, Any
from app.models.farm import FarmInput
from app.calculations.farm_calculator import (
    calculate_irrigation,
    calculate_water_savings,
    calculate_crop_residue,
    calculate_environmental_impact,
    analyze_farm,
)


def tool_calculate_irrigation(
    crop: str,
    area_acres: float,
    soil_type: str,
    current_irrigation_mm: float,
    location: str,
    rainfall_probability: float,
    soil_moisture_percent: float,
) -> Dict[str, Any]:
    """Calculate the precise irrigation depth (mm) and operational action required for a farm plot.

    Args:
        crop: Crop name (wheat, rice, maize, sugarcane)
        area_acres: Field size in acres
        soil_type: Soil texture (alluvial, loamy, clayey, sandy, black, red)
        current_irrigation_mm: Current farmer scheduled water application depth in mm
        location: Indian state / agro-climatic region
        rainfall_probability: Probability of precipitation in next 24-48h (0.0 to 1.0)
        soil_moisture_percent: Current soil moisture level (0.0 to 100.0%)

    Returns:
        Dictionary containing recommended_irrigation_mm, status, urgency, and explanation.
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
    result = calculate_irrigation(farm_input)
    return result.model_dump()


def tool_calculate_water_savings(
    crop: str,
    area_acres: float,
    soil_type: str,
    current_irrigation_mm: float,
    recommended_irrigation_mm: float,
    location: str = "Uttar Pradesh",
    rainfall_probability: float = 0.0,
    soil_moisture_percent: float = 50.0,
) -> Dict[str, Any]:
    """Calculate total water consumption in liters, potential water savings, and pump energy saved.

    Args:
        crop: Crop name
        area_acres: Field size in acres
        soil_type: Soil texture
        current_irrigation_mm: Farmer's current water application in mm
        recommended_irrigation_mm: System recommended water application in mm
        location: Region
        rainfall_probability: Rain forecast probability
        soil_moisture_percent: Soil moisture percent

    Returns:
        Dictionary with current_water_liters, recommended_water_liters, water_savings_liters, water_savings_percent.
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
    result = calculate_water_savings(farm_input, recommended_irrigation_mm)
    return result.model_dump()


def tool_calculate_crop_residue(
    crop: str,
    area_acres: float,
    soil_type: str = "alluvial",
    current_irrigation_mm: float = 50.0,
    location: str = "Uttar Pradesh",
    rainfall_probability: float = 0.0,
    soil_moisture_percent: float = 50.0,
) -> Dict[str, Any]:
    """Estimate stubble/crop residue biomass produced, stubble burning risk, and sustainable practices.

    Args:
        crop: Crop name
        area_acres: Field size in acres

    Returns:
        Dictionary with estimated_residue_tonnes, stubble_burning_risk, recommended_practices, economic_potential_inr.
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
    result = calculate_crop_residue(farm_input)
    return result.model_dump()


def tool_analyze_farm_pipeline(
    crop: str,
    area_acres: float,
    soil_type: str,
    current_irrigation_mm: float,
    location: str,
    rainfall_probability: float,
    soil_moisture_percent: float,
) -> Dict[str, Any]:
    """Execute end-to-end deterministic farm advisory calculation pipeline."""
    farm_input = FarmInput(
        crop=crop,
        area_acres=area_acres,
        soil_type=soil_type,
        current_irrigation_mm=current_irrigation_mm,
        location=location,
        rainfall_probability=rainfall_probability,
        soil_moisture_percent=soil_moisture_percent,
    )
    result = analyze_farm(farm_input)
    return result.model_dump()
