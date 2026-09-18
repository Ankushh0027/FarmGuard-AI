"""Deterministic agricultural calculations for FarmGuard AI.

Contains explicit agronomic formulas and centralized prototype assumptions for
irrigation requirements, water volume conservation, crop residue generation,
and environmental footprint metrics.
"""

from typing import Dict, Any, List, Optional
from app.models.farm import (
    FarmInput,
    CropWaterRequirement,
    IrrigationRecommendation,
    WaterAnalysis,
    ResidueEstimate,
    EnvironmentalImpact,
    AssumptionItem,
    FarmAnalysisResponse,
)

# ============================================================================
# CENTRALIZED AGRONOMIC ASSUMPTIONS & CONSTANTS (PROTOTYPE BASELINES)
# ============================================================================
# Exact geometric conversion: 1 acre = 4,046.8564 m²; 1 mm depth on 1 m² = 1 L
LITERS_PER_ACRE_MM = 4046.8564

# Prototype assumption: Average discharge capacity of standard 5 HP agricultural tubewell pump
TUBEWELL_PUMP_DISCHARGE_LPH = 28000.0

# Crop prototype characteristics:
# Baseline single irrigation depth (mm), target moisture %, critical stress threshold %,
# residue yield (tonnes/acre), burning emissions factors (kg/tonne), and fodder/market valuation (INR/tonne).
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
            "Mulching to preserve topsoil moisture and reduce evaporative loss",
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

# Soil moisture retention capacity coefficients (prototype estimates)
SOIL_DATA: Dict[str, Dict[str, Any]] = {
    "alluvial": {"retention_factor": 1.00, "drainage": "Moderate", "description": "Fertile floodplain soil with balanced drainage"},
    "loamy": {"retention_factor": 1.00, "drainage": "Optimal", "description": "Ideal soil texture with high moisture holding capacity"},
    "sandy loam": {"retention_factor": 0.85, "drainage": "Moderately Fast", "description": "Permeable sandy-loam with moderate water holding capacity"},
    "clayey": {"retention_factor": 1.20, "drainage": "Slow", "description": "Dense texture; holds water longer, lower evaporation rate"},
    "clay loam": {"retention_factor": 1.10, "drainage": "Moderate-Slow", "description": "Heavy loam with good nutrient and water retention"},
    "sandy": {"retention_factor": 0.80, "drainage": "Fast", "description": "High porosity; low water holding capacity requiring split doses"},
    "black": {"retention_factor": 1.25, "drainage": "Very Slow", "description": "High swell-shrink clay (Vertisols) with superior water retention"},
    "red": {"retention_factor": 0.90, "drainage": "Moderately Fast", "description": "Permeable soil requiring moderate irrigation frequency"},
}


# ============================================================================
# DETERMINISTIC CALCULATION FUNCTIONS
# ============================================================================

def get_crop_water_requirement(crop: str, soil_type: Optional[str] = "alluvial") -> CropWaterRequirement:
    """Retrieve baseline crop water requirements, soil target moisture, and retention dynamics."""
    crop_norm = crop.strip().lower()
    if crop_norm not in CROP_DATA:
        supported = list(CROP_DATA.keys())
        raise ValueError(f"Unsupported crop '{crop}'. Supported crops: {', '.join(supported)}")

    crop_info = CROP_DATA[crop_norm]
    soil_norm = soil_type.strip().lower() if soil_type else "alluvial"
    soil_info = SOIL_DATA.get(soil_norm, SOIL_DATA.get("loamy", {"retention_factor": 1.0}))

    retention_factor = soil_info.get("retention_factor", 1.0)
    adjusted_depth = round(crop_info["base_irrigation_depth_mm"] / retention_factor, 1)

    return CropWaterRequirement(
        crop=crop_norm,
        base_irrigation_depth_mm=crop_info["base_irrigation_depth_mm"],
        target_moisture_percent=crop_info["target_moisture_percent"],
        critical_moisture_percent=crop_info["critical_moisture_percent"],
        soil_type=soil_norm,
        soil_retention_factor=retention_factor,
        adjusted_irrigation_depth_mm=adjusted_depth,
        description=(
            f"{crop_norm.capitalize()} baseline single irrigation requirement is {crop_info['base_irrigation_depth_mm']} mm, "
            f"adjusted to {adjusted_depth} mm for {soil_norm} soil (retention: {retention_factor}x)."
        ),
    )


def calculate_irrigation(farm_input: FarmInput) -> IrrigationRecommendation:
    """Calculate deterministic irrigation depth recommendation in mm based on soil moisture and precipitation data.

    Scientific Hardening Rules:
    - If forecast_rainfall_mm is provided: Uses the actual forecasted depth in the water balance equation.
    - If forecast_rainfall_mm is None (probability only): Does NOT manufacture a rainfall amount.
      Treats rainfall_probability strictly as a risk/context factor.
    """
    crop_info = CROP_DATA.get(farm_input.crop, CROP_DATA["wheat"])
    soil_info = SOIL_DATA.get(farm_input.soil_type, SOIL_DATA["loamy"])

    target_moisture = crop_info["target_moisture_percent"]
    critical_moisture = crop_info["critical_moisture_percent"]
    base_depth = crop_info["base_irrigation_depth_mm"]
    soil_retention = soil_info["retention_factor"]

    current_moisture = farm_input.soil_moisture_percent
    rain_prob = farm_input.rainfall_probability
    forecast_rain_mm = farm_input.forecast_rainfall_mm

    # 1. Soil moisture deficit calculation
    deficit_percent = max(0.0, target_moisture - current_moisture)
    depletion_ratio = deficit_percent / target_moisture if target_moisture > 0 else 0.0

    # Raw water requirement to restore field capacity (accounting for soil retention)
    raw_requirement_mm = (base_depth * depletion_ratio) / soil_retention

    # 2. Case Analysis: Rainfall Forecast Depth vs. Probability Only
    if current_moisture >= target_moisture:
        recommended_mm = 0.0
        status = "Optimal Soil Moisture"
        urgency = "Low"
        action = "Hold irrigation. Soil moisture is at or above target capacity."
        rain_status = "amount_known" if forecast_rain_mm is not None else "no_rain"
        expected_rain_offset_mm = 0.0
        explanation = (
            f"Current soil moisture ({current_moisture:.1f}%) meets or exceeds the target ({target_moisture:.1f}%) "
            f"for {farm_input.crop.capitalize()} on {farm_input.soil_type} soil. No additional irrigation required."
        )

    elif forecast_rain_mm is not None:
        # Case A: Actual forecasted precipitation amount in mm is available
        rain_status = "amount_known"
        expected_rain_offset_mm = round(min(raw_requirement_mm, max(0.0, forecast_rain_mm)), 1)
        net_irrigation_mm = max(0.0, round(raw_requirement_mm - forecast_rain_mm, 1))

        if forecast_rain_mm >= raw_requirement_mm:
            recommended_mm = 0.0
            status = "Postpone Irrigation (Forecast Rainfall Sufficient)"
            urgency = "Low"
            action = f"Postpone irrigation. Forecast precipitation (~{forecast_rain_mm:.1f} mm) is expected to satisfy the {raw_requirement_mm:.1f} mm moisture deficit."
            explanation = (
                f"Soil moisture deficit is {raw_requirement_mm:.1f} mm for {farm_input.crop.capitalize()}. "
                f"Forecast rainfall amount ({forecast_rain_mm:.1f} mm) meets or exceeds this deficit without pumping."
            )
        elif net_irrigation_mm > 0:
            recommended_mm = net_irrigation_mm
            status = "Reduced Irrigation Recommended"
            urgency = "Medium"
            action = f"Apply reduced irrigation of {recommended_mm} mm across {farm_input.area_acres} acres."
            explanation = (
                f"Soil moisture deficit is {raw_requirement_mm:.1f} mm. Factoring in {forecast_rain_mm:.1f} mm of "
                f"forecast rainfall reduces the net irrigation requirement to {recommended_mm} mm."
            )
        else:
            recommended_mm = 0.0
            status = "Hold Irrigation"
            urgency = "Low"
            action = "Hold irrigation based on forecast rainfall balance."
            explanation = f"Water balance indicates net requirement is 0 mm with {forecast_rain_mm:.1f} mm forecast rain."

    else:
        # Case B: Only rainfall probability is available (precipitation depth is unknown)
        # We do NOT fabricate a rainfall amount.
        rain_status = "probability_only" if rain_prob > 0 else "no_rain"
        expected_rain_offset_mm = 0.0
        net_irrigation_mm = round(raw_requirement_mm, 1)
        recommended_mm = net_irrigation_mm

        if rain_prob >= 0.60:
            status = "Check Local Forecast Before Irrigating"
            urgency = "Medium"
            action = (
                f"Soil moisture deficit indicates {recommended_mm} mm is needed. Rain probability is high ({rain_prob * 100:.0f}%), "
                f"but expected rainfall depth is unknown. Re-check local weather before full application."
            )
            explanation = (
                f"Soil moisture ({current_moisture:.1f}%) is {deficit_percent:.1f}% below target for {farm_input.crop.capitalize()}. "
                f"Rain probability is {rain_prob * 100:.0f}%, but precipitation amount is unconfirmed. "
                f"Do not assume rain will fully satisfy the {recommended_mm} mm deficit without checking local radar/forecast depth."
            )
        elif current_moisture < critical_moisture:
            status = "Irrigate Urgently"
            urgency = "High" if current_moisture > (critical_moisture * 0.7) else "Critical"
            action = f"Apply {recommended_mm} mm of irrigation across {farm_input.area_acres} acres immediately."
            explanation = (
                f"Soil moisture ({current_moisture:.1f}%) has fallen below critical threshold ({critical_moisture:.1f}%). "
                f"Crop is experiencing moisture stress. Apply {recommended_mm} mm to restore root zone capacity."
            )
        else:
            status = "Moderate Irrigation Recommended"
            urgency = "Medium"
            action = f"Schedule light irrigation of {recommended_mm} mm."
            explanation = (
                f"Moisture is moderately depleted ({deficit_percent:.1f}% below target) for {farm_input.crop.capitalize()}. "
                f"Applying {recommended_mm} mm restores field capacity for {farm_input.soil_type} soil."
            )

    return IrrigationRecommendation(
        recommended_irrigation_mm=recommended_mm,
        status=status,
        urgency=urgency,
        action=action,
        soil_depletion_percent=round(deficit_percent, 1),
        expected_rain_offset_mm=expected_rain_offset_mm,
        rain_forecast_status=rain_status,
        explanation=explanation,
    )


def calculate_water_savings(farm_input: FarmInput, recommended_mm: float) -> WaterAnalysis:
    """Calculate water volumes in liters and quantify conservation metrics."""
    area = farm_input.area_acres
    current_mm = max(0.0, farm_input.current_irrigation_mm)
    recommended_mm_val = max(0.0, recommended_mm)

    current_liters = round(current_mm * area * LITERS_PER_ACRE_MM, 1)
    recommended_liters = round(recommended_mm_val * area * LITERS_PER_ACRE_MM, 1)

    # Water savings guaranteed non-negative
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

    # Estimated avoided emissions if open stubble burning is prevented
    co2e_avoided = round(residue_estimate.estimated_residue_tonnes * crop_info["co2_kg_per_tonne_burned"], 1)
    pm25_avoided = round(residue_estimate.estimated_residue_tonnes * crop_info["pm25_kg_per_tonne_burned"], 2)

    water_saved_liters = max(0.0, water_analysis.water_savings_liters)
    water_saved_m3 = round(water_saved_liters / 1000.0, 2)

    soil_benefit = (
        f"In-situ incorporation of {residue_estimate.estimated_residue_tonnes} tonnes of {farm_input.crop} residue "
        f"preserves essential nitrogen, phosphorus, and potassium (NPK) and contributes to soil organic carbon replenishment."
    )

    return EnvironmentalImpact(
        co2e_avoided_kg=co2e_avoided,
        pm25_avoided_kg=pm25_avoided,
        water_saved_liters=water_saved_liters,
        water_saved_cubic_meters=water_saved_m3,
        soil_health_benefit=soil_benefit,
    )


def generate_assumptions(farm_input: FarmInput, irrigation_rec: IrrigationRecommendation) -> List[AssumptionItem]:
    """Compile structured, transparent assumptions across weather, agronomy, and environment."""
    items: List[AssumptionItem] = []

    # Weather assumption
    if farm_input.forecast_rainfall_mm is not None:
        items.append(AssumptionItem(
            type="weather",
            text=f"Precipitation depth of {farm_input.forecast_rainfall_mm} mm used directly in root-zone water balance."
        ))
    elif farm_input.rainfall_probability > 0:
        items.append(AssumptionItem(
            type="weather",
            text=f"Rainfall probability of {farm_input.rainfall_probability * 100:.0f}% is treated as a risk signal only; rainfall depth is unconfirmed."
        ))
    else:
        items.append(AssumptionItem(
            type="weather",
            text="No immediate precipitation forecast factored into current calculation."
        ))

    # Agronomic model assumption
    items.append(AssumptionItem(
        type="agronomic_model",
        text=f"Crop water baseline ({CROP_DATA.get(farm_input.crop, {}).get('base_irrigation_depth_mm', 50)} mm) and soil retention ({SOIL_DATA.get(farm_input.soil_type, {}).get('retention_factor', 1.0)}x) are prototype constants."
    ))
    items.append(AssumptionItem(
        type="agronomic_model",
        text="Volumetric water conversions use exact geometric constant: 1 acre-mm = 4,046.86 Liters."
    ))

    # Environmental / equipment assumptions
    items.append(AssumptionItem(
        type="environmental_impact",
        text="Tubewell pumping hours assume a prototype 5 HP centrifugal pump discharge rate (~28,000 L/hr)."
    ))
    items.append(AssumptionItem(
        type="environmental_impact",
        text="Avoided CO2e and PM2.5 emissions reflect prototype combustion factors assuming 100% open-field burning prevention."
    ))

    return items


def analyze_farm(farm_input: FarmInput) -> FarmAnalysisResponse:
    """Master pure function orchestrating the complete deterministic analysis pipeline."""
    irrigation_rec = calculate_irrigation(farm_input)
    water_analysis = calculate_water_savings(farm_input, irrigation_rec.recommended_irrigation_mm)
    residue_est = calculate_crop_residue(farm_input)
    env_impact = calculate_environmental_impact(farm_input, water_analysis, residue_est)
    assumptions_list = generate_assumptions(farm_input, irrigation_rec)

    notes = [
        "Calculations reflect deterministic prototype models and are not guaranteed real-world prescriptions.",
        "Volumetric conversion uses standard 1 acre-mm = 4,046.86 Liters.",
        "Weather recommendations should be validated against local meteorological radar before altering field irrigation."
    ]

    return FarmAnalysisResponse(
        farm_input=farm_input,
        irrigation_recommendation=irrigation_rec,
        water_analysis=water_analysis,
        residue_estimate=residue_est,
        environmental_impact=env_impact,
        assumptions=assumptions_list,
        notes=notes,
    )
