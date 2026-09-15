"""Deterministic agricultural calculations for FarmGuard AI.

Contains explicit formulas and centralized assumptions for irrigation requirement,
water volume savings, crop residue generation, and environmental footprint metrics.
"""

from typing import Dict, Any, List
from app.models.farm import (
    FarmInput,
    IrrigationRecommendation,
    WaterAnalysis,
    ResidueEstimate,
    EnvironmentalImpact,
    FarmAnalysisResponse,
)

# ============================================================================
# CENTRALIZED AGRONOMIC ASSUMPTIONS & CONSTANTS
# ============================================================================
# 1 acre = 4,046.86 square meters
# 1 mm of water depth over 1 sq meter = 1 Liter
# Therefore: 1 acre-mm = 4,046.86 Liters
LITERS_PER_ACRE_MM = 4046.8564

# Average discharge capacity of standard North Indian agricultural tubewell (5 HP pump): ~28,000 Liters/hour
TUBEWELL_PUMP_DISCHARGE_LPH = 28000.0

# Crop specific assumptions
# (Baseline single irrigation depth demand in mm, target moisture %, critical moisture threshold %,
# residue tonnes/acre, burning emission factors in kg/tonne, economic valuation in INR/tonne)
CROP_DATA: Dict[str, Dict[str, Any]] = {
    "wheat": {
        "base_irrigation_depth_mm": 50.0,
        "target_moisture_percent": 65.0,
        "critical_moisture_percent": 40.0,
        "residue_tonnes_per_acre": 1.9,
        "stubble_burning_risk": "High",
        "co2_kg_per_tonne_burned": 1460.0,
        "pm25_kg_per_tonne_burned": 7.5,
        "economic_value_inr_per_tonne": 1200.0,
        "recommended_practices": [
            "In-situ stubble retention with Super SMS / Happy Seeder for direct wheat/next crop sowing",
            "Mulching to preserve topsoil moisture and prevent evaporative loss by up to 20%",
            "Apply Pusa Bio-decomposer spray for accelerated in-field decomposition",
            "Collection for cattle fodder (dry Bhoosa) or biomass briquetting"
        ]
    },
    "rice": {
        "base_irrigation_depth_mm": 75.0,
        "target_moisture_percent": 85.0,
        "critical_moisture_percent": 60.0,
        "residue_tonnes_per_acre": 2.5,
        "stubble_burning_risk": "High",
        "co2_kg_per_tonne_burned": 1510.0,
        "pm25_kg_per_tonne_burned": 9.0,
        "economic_value_inr_per_tonne": 850.0,
        "recommended_practices": [
            "Use Straw Management System (SMS) fitted combine harvesters",
            "In-situ soil incorporation using Rotavator / Mulcher with microbial consortia",
            "Baling and supplying to nearest biomass power or compressed bio-gas (CBG) plants",
            "Substrate utilization for commercial mushroom cultivation"
        ]
    },
    "maize": {
        "base_irrigation_depth_mm": 45.0,
        "target_moisture_percent": 60.0,
        "critical_moisture_percent": 35.0,
        "residue_tonnes_per_acre": 2.0,
        "stubble_burning_risk": "Moderate",
        "co2_kg_per_tonne_burned": 1400.0,
        "pm25_kg_per_tonne_burned": 6.0,
        "economic_value_inr_per_tonne": 1000.0,
        "recommended_practices": [
            "Shred and incorporate stalks directly into soil to replenish organic carbon",
            "Silage making for dairy cattle feed",
            "Surface mulching for weed suppression and soil moisture conservation"
        ]
    },
    "sugarcane": {
        "base_irrigation_depth_mm": 65.0,
        "target_moisture_percent": 75.0,
        "critical_moisture_percent": 50.0,
        "residue_tonnes_per_acre": 3.5,
        "stubble_burning_risk": "Moderate",
        "co2_kg_per_tonne_burned": 1380.0,
        "pm25_kg_per_tonne_burned": 5.5,
        "economic_value_inr_per_tonne": 600.0,
        "recommended_practices": [
            "Trash shredding and inter-row mulching (Trash Blanketing) in ratoon crop",
            "Composting with Trichoderma / microbial culture",
            "Use as boiler fuel in local khandsari/sugar units or pelletization"
        ]
    },
}

# Soil moisture retention capacity coefficients
SOIL_DATA: Dict[str, Dict[str, Any]] = {
    "alluvial": {"retention_factor": 1.00, "drainage": "Moderate", "description": "Fertile floodplain soil with balanced drainage"},
    "loamy": {"retention_factor": 1.00, "drainage": "Optimal", "description": "Ideal soil texture with high moisture holding capacity"},
    "clayey": {"retention_factor": 1.20, "drainage": "Slow", "description": "Dense texture; holds water longer, lower evaporation rate"},
    "sandy": {"retention_factor": 0.80, "drainage": "Fast", "description": "High porosity; low water holding capacity requiring split doses"},
    "black": {"retention_factor": 1.25, "drainage": "Very Slow", "description": "High swell-shrink clay (Vertisols) with superior water retention"},
    "red": {"retention_factor": 0.90, "drainage": "Moderately Fast", "description": "Permeable soil requiring moderate irrigation frequency"},
}


# ============================================================================
# DETERMINISTIC CALCULATION FUNCTIONS
# ============================================================================

def calculate_irrigation(farm_input: FarmInput) -> IrrigationRecommendation:
    """Calculate deterministic irrigation depth recommendation in mm based on soil moisture and rain forecast."""
    crop_info = CROP_DATA.get(farm_input.crop, CROP_DATA["wheat"])
    soil_info = SOIL_DATA.get(farm_input.soil_type, SOIL_DATA["loamy"])

    target_moisture = crop_info["target_moisture_percent"]
    critical_moisture = crop_info["critical_moisture_percent"]
    base_depth = crop_info["base_irrigation_depth_mm"]
    soil_retention = soil_info["retention_factor"]

    current_moisture = farm_input.soil_moisture_percent
    rain_prob = farm_input.rainfall_probability

    # Calculate soil moisture deficit percentage
    deficit_percent = max(0.0, target_moisture - current_moisture)
    depletion_ratio = deficit_percent / target_moisture if target_moisture > 0 else 0.0

    # Base water requirement adjustment
    # Higher soil retention means less water is needed to restore root-zone field capacity
    raw_requirement_mm = (base_depth * depletion_ratio) / soil_retention

    # Rain offset calculation (effective rain credit)
    # If rain probability >= 60%, credit up to 25mm of natural irrigation
    if rain_prob >= 0.70:
        expected_rain_offset_mm = round(rain_prob * 30.0, 1)
    elif rain_prob >= 0.40:
        expected_rain_offset_mm = round(rain_prob * 18.0, 1)
    else:
        expected_rain_offset_mm = round(rain_prob * 5.0, 1)

    # Net recommended irrigation
    net_irrigation_mm = max(0.0, raw_requirement_mm - expected_rain_offset_mm)
    recommended_mm = round(net_irrigation_mm, 1)

    # Determine status, urgency, and actionable guidance
    if current_moisture >= target_moisture:
        recommended_mm = 0.0
        status = "Optimal Soil Moisture"
        urgency = "Low"
        action = "Hold irrigation. Soil moisture is at or above target capacity."
        explanation = (
            f"Current soil moisture ({current_moisture:.1f}%) meets or exceeds the target ({target_moisture:.1f}%) "
            f"for {farm_input.crop.capitalize()} on {farm_input.soil_type} soil. No additional irrigation required."
        )
    elif rain_prob >= 0.70 and recommended_mm < 20.0:
        recommended_mm = 0.0
        status = "Postpone Irrigation (Rain Expected)"
        urgency = "Low"
        action = "Postpone irrigation. High probability of natural precipitation."
        explanation = (
            f"Upcoming rainfall probability is high ({rain_prob * 100:.0f}%). Expected natural rain offset of "
            f"~{expected_rain_offset_mm} mm will fulfill soil moisture deficit without pumping."
        )
    elif current_moisture < critical_moisture:
        status = "Irrigate Urgently"
        urgency = "High" if current_moisture > (critical_moisture * 0.7) else "Critical"
        action = f"Apply {recommended_mm} mm of irrigation across {farm_input.area_acres} acres immediately."
        explanation = (
            f"Soil moisture ({current_moisture:.1f}%) has fallen below critical threshold ({critical_moisture:.1f}%). "
            f"Crop is experiencing water stress. Apply {recommended_mm} mm to restore root zone moisture."
        )
    else:
        status = "Moderate Irrigation Recommended"
        urgency = "Medium"
        action = f"Schedule light irrigation of {recommended_mm} mm."
        explanation = (
            f"Moisture is moderately depleted ({deficit_percent:.1f}% below target) for {farm_input.crop.capitalize()}. "
            f"Applying {recommended_mm} mm accounts for soil retention factor ({soil_retention}x) and {rain_prob * 100:.0f}% rain forecast."
        )

    return IrrigationRecommendation(
        recommended_irrigation_mm=recommended_mm,
        status=status,
        urgency=urgency,
        action=action,
        soil_depletion_percent=round(deficit_percent, 1),
        expected_rain_offset_mm=expected_rain_offset_mm,
        explanation=explanation,
    )


def calculate_water_savings(farm_input: FarmInput, recommended_mm: float) -> WaterAnalysis:
    """Calculate water volumes in liters and quantify conservation metrics."""
    area = farm_input.area_acres
    current_mm = farm_input.current_irrigation_mm

    current_liters = round(current_mm * area * LITERS_PER_ACRE_MM, 1)
    recommended_liters = round(recommended_mm * area * LITERS_PER_ACRE_MM, 1)

    # Water savings (only positive if current exceeds recommended, else 0)
    if current_liters > recommended_liters:
        savings_liters = round(current_liters - recommended_liters, 1)
        savings_percent = round((savings_liters / current_liters) * 100.0, 1) if current_liters > 0 else 0.0
    else:
        savings_liters = 0.0
        savings_percent = 0.0

    pump_hours_saved = round(savings_liters / TUBEWELL_PUMP_DISCHARGE_LPH, 1) if savings_liters > 0 else 0.0

    return WaterAnalysis(
        current_water_liters=current_liters,
        recommended_water_liters=recommended_liters,
        water_savings_liters=savings_liters,
        water_savings_percent=savings_percent,
        diesel_or_electricity_savings_hours=pump_hours_saved,
    )


def calculate_crop_residue(farm_input: FarmInput) -> ResidueEstimate:
    """Estimate total crop residue yield and provide eco-friendly disposal methods."""
    crop_info = CROP_DATA.get(farm_input.crop, CROP_DATA["wheat"])
    residue_rate = crop_info["residue_tonnes_per_acre"]
    total_residue_tonnes = round(farm_input.area_acres * residue_rate, 2)
    economic_val = round(total_residue_tonnes * crop_info["economic_value_inr_per_tonne"], 1)

    return ResidueEstimate(
        crop=farm_input.crop,
        area_acres=farm_input.area_acres,
        estimated_residue_tonnes=total_residue_tonnes,
        stubble_burning_risk=crop_info["stubble_burning_risk"],
        recommended_practices=crop_info["recommended_practices"],
        economic_potential_inr=economic_val,
    )


def calculate_environmental_impact(
    farm_input: FarmInput,
    water_analysis: WaterAnalysis,
    residue_estimate: ResidueEstimate
) -> EnvironmentalImpact:
    """Calculate carbon footprint avoidance, PM2.5 avoidance, and soil health improvements."""
    crop_info = CROP_DATA.get(farm_input.crop, CROP_DATA["wheat"])

    # Avoided emissions by preventing in-situ stubble burning
    co2e_avoided = round(residue_estimate.estimated_residue_tonnes * crop_info["co2_kg_per_tonne_burned"], 1)
    pm25_avoided = round(residue_estimate.estimated_residue_tonnes * crop_info["pm25_kg_per_tonne_burned"], 2)

    water_saved_liters = water_analysis.water_savings_liters
    water_saved_m3 = round(water_saved_liters / 1000.0, 2)

    soil_benefit = (
        f"In-situ incorporation of {residue_estimate.estimated_residue_tonnes} tonnes of {farm_input.crop} residue "
        f"retains essential soil nitrogen, phosphorus, potassium (NPK) and boosts Soil Organic Carbon (SOC) by up to 0.15%."
    )

    return EnvironmentalImpact(
        co2e_avoided_kg=co2e_avoided,
        pm25_avoided_kg=pm25_avoided,
        water_saved_liters=water_saved_liters,
        water_saved_cubic_meters=water_saved_m3,
        soil_health_benefit=soil_benefit,
    )


def analyze_farm(farm_input: FarmInput) -> FarmAnalysisResponse:
    """Master pure function orchestrating the complete deterministic analysis pipeline."""
    irrigation_rec = calculate_irrigation(farm_input)
    water_analysis = calculate_water_savings(farm_input, irrigation_rec.recommended_irrigation_mm)
    residue_est = calculate_crop_residue(farm_input)
    env_impact = calculate_environmental_impact(farm_input, water_analysis, residue_est)

    notes = [
        "Calculation engine uses standardized North Indian agro-climatic assumptions (ICAR & PAU guidelines).",
        "1 acre-mm corresponds precisely to 4,046.86 Liters of water.",
        "Emissions avoided calculations reflect prevention of direct open-field stubble combustion."
    ]

    return FarmAnalysisResponse(
        farm_input=farm_input,
        irrigation_recommendation=irrigation_rec,
        water_analysis=water_analysis,
        residue_estimate=residue_est,
        environmental_impact=env_impact,
        notes=notes,
    )
