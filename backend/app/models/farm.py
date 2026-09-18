"""Pydantic models for FarmGuard AI farm data, recommendations, and agent communication."""

from enum import Enum
from typing import List, Optional, Any, Dict, Union
from pydantic import BaseModel, Field, field_validator


class CropType(str, Enum):
    WHEAT = "wheat"
    RICE = "rice"
    MAIZE = "maize"
    SUGARCANE = "sugarcane"


class SoilType(str, Enum):
    ALLUVIAL = "alluvial"
    LOAMY = "loamy"
    SANDY_LOAM = "sandy loam"
    CLAYEY = "clayey"
    CLAY_LOAM = "clay loam"
    SANDY = "sandy"
    BLACK = "black"
    RED = "red"


SOIL_ALIASES = {
    "alluvial": "alluvial",
    "loam": "loamy",
    "loamy": "loamy",
    "sandy loam": "sandy loam",
    "sandy_loam": "sandy loam",
    "sandy-loam": "sandy loam",
    "clay": "clayey",
    "clayey": "clayey",
    "clay loam": "clay loam",
    "clay_loam": "clay loam",
    "sand": "sandy",
    "sandy": "sandy",
    "black": "black",
    "black soil": "black",
    "red": "red",
    "red soil": "red",
}


class FarmInput(BaseModel):
    """Input parameters for farm analysis."""
    crop: str = Field(..., description="Crop type (e.g. wheat, rice, maize, sugarcane)")
    area_acres: float = Field(..., gt=0, description="Farm area in acres (must be > 0)")
    soil_type: str = Field(..., description="Soil type (e.g. alluvial, loamy, sandy loam, clayey, sandy, black, red)")
    current_irrigation_mm: float = Field(..., ge=0, description="Current planned or scheduled irrigation depth in mm")
    location: str = Field(..., min_length=2, description="Farm location/state (e.g. Uttar Pradesh, Punjab, Haryana)")
    rainfall_probability: float = Field(
        0.0,
        description="Forecasted rainfall probability within next 24-48 hours (0.0 to 1.0 or 0 to 100%)"
    )
    forecast_rainfall_mm: Optional[float] = Field(
        None,
        ge=0.0,
        description="Forecast precipitation depth in mm from weather service (if available)"
    )
    soil_moisture_percent: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Current soil moisture level in percentage (0.0 to 100.0%)"
    )

    @field_validator("crop")
    @classmethod
    def validate_crop(cls, v: str) -> str:
        normalized = v.strip().lower()
        supported = [c.value for c in CropType]
        if normalized not in supported:
            raise ValueError(
                f"Unsupported crop '{v}'. Supported crops are: {', '.join(supported)}"
            )
        return normalized

    @field_validator("soil_type")
    @classmethod
    def validate_soil_type(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized in SOIL_ALIASES:
            return SOIL_ALIASES[normalized]
        supported = [s.value for s in SoilType]
        raise ValueError(
            f"Unsupported soil type '{v}'. Supported types are: {', '.join(supported)}"
        )

    @field_validator("rainfall_probability", mode="before")
    @classmethod
    def validate_rainfall_probability(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            val = float(v)
        except (TypeError, ValueError):
            raise ValueError(f"Rainfall probability must be a valid number, got {v}")
        if val < 0.0 or val > 100.0:
            raise ValueError(f"Rainfall probability must be between 0.0 and 1.0 (or 0 to 100%), got {val}")
        # If entered as a percentage (e.g., 70 for 70%), normalize to 0.70
        if val > 1.0:
            val = round(val / 100.0, 4)
        return val


class CropWaterRequirement(BaseModel):
    """Agronomic crop water requirement baseline."""
    crop: str
    base_irrigation_depth_mm: float
    target_moisture_percent: float
    critical_moisture_percent: float
    soil_type: str
    soil_retention_factor: float
    adjusted_irrigation_depth_mm: float
    description: str


class IrrigationRecommendation(BaseModel):
    """Deterministic irrigation guidance."""
    recommended_irrigation_mm: float = Field(..., ge=0)
    status: str = Field(..., description="Operational status: e.g., 'Delay Irrigation', 'Irrigate Now', 'Optimal'")
    urgency: str = Field(..., description="Urgency level: 'Low', 'Medium', 'High', 'Critical'")
    action: str = Field(..., description="Direct tactical action for the farmer")
    soil_depletion_percent: float = Field(..., description="Calculated moisture deficit from field capacity")
    expected_rain_offset_mm: float = Field(0.0, description="Effective rainfall deduction applied in mm")
    rain_forecast_status: str = Field("probability_only", description="'amount_known', 'probability_only', 'no_rain'")
    explanation: str = Field(..., description="Clear deterministic explanation of the recommendation")


class WaterAnalysis(BaseModel):
    """Water volume analysis and savings."""
    current_water_liters: float = Field(..., ge=0)
    recommended_water_liters: float = Field(..., ge=0)
    water_savings_liters: float = Field(..., ge=0)
    water_savings_percent: float = Field(..., ge=0)
    diesel_or_electricity_savings_hours: float = Field(
        ...,
        ge=0,
        description="Estimated tubewell / pump running hours saved"
    )


class ResidueEstimate(BaseModel):
    """Crop residue generation and management strategy."""
    crop: str
    area_acres: float
    estimated_residue_tonnes: float
    stubble_burning_risk: str = Field(..., description="'High', 'Medium', 'Low'")
    recommended_practices: List[str]
    economic_potential_inr: float = Field(
        ...,
        ge=0,
        description="Estimated valorization value (bio-pellets, mulching benefits, compost)"
    )


class EnvironmentalImpact(BaseModel):
    """Environmental sustainability and carbon footprint metrics."""
    co2e_avoided_kg: float = Field(
        ...,
        ge=0,
        description="Estimated CO2 equivalent emissions avoided by preventing residue burning"
    )
    pm25_avoided_kg: float = Field(
        ...,
        ge=0,
        description="Particulate matter (PM2.5) emissions avoided"
    )
    water_saved_liters: float = Field(..., ge=0)
    water_saved_cubic_meters: float = Field(..., ge=0)
    soil_health_benefit: str


class AssumptionItem(BaseModel):
    """Structured assumption metadata categorizing models, weather, and estimates."""
    type: str = Field(..., description="'weather', 'agronomic_model', 'environmental_impact', 'input'")
    text: str = Field(..., description="Explanation of the assumption / prototype limitation")


class FarmAnalysisResponse(BaseModel):
    """Complete aggregated farm analysis response."""
    farm_input: FarmInput
    irrigation_recommendation: IrrigationRecommendation
    water_analysis: WaterAnalysis
    residue_estimate: ResidueEstimate
    environmental_impact: EnvironmentalImpact
    assumptions: List[AssumptionItem] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)


class ToolTraceItem(BaseModel):
    """Execution metadata for a deterministic tool call."""
    tool: str
    status: str = "completed"
    summary: Optional[str] = None


class AgentAdviceRequest(BaseModel):
    """Input payload for Gemini advisory agent."""
    message: Optional[str] = Field(None, description="Natural language question or farmer prompt")
    farm: Optional[Dict[str, Any]] = Field(None, description="Structured farm parameters if available")


class AgentAdviceResponse(BaseModel):
    """Structured response from Gemini advisory agent."""
    answer: str = Field(..., description="Synthesized farmer advisory")
    recommendation: Dict[str, Any] = Field(..., description="Operational recommendation highlights")
    tool_trace: List[ToolTraceItem] = Field(default_factory=list, description="High-level tool execution log")
    numerical_results: Optional[Dict[str, Any]] = Field(None, description="Pure tool calculation results")
    assumptions: List[AssumptionItem] = Field(default_factory=list, description="Explicit categorized assumptions and uncertainties")
    missing_fields: Optional[List[str]] = Field(None, description="List of required fields missing from request if any")
