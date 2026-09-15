"""Pydantic models for FarmGuard AI farm data and recommendations."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class CropType(str, Enum):
    WHEAT = "wheat"
    RICE = "rice"
    MAIZE = "maize"
    SUGARCANE = "sugarcane"


class SoilType(str, Enum):
    ALLUVIAL = "alluvial"
    LOAMY = "loamy"
    CLAYEY = "clayey"
    SANDY = "sandy"
    BLACK = "black"
    RED = "red"


class FarmInput(BaseModel):
    """Input parameters for farm analysis."""
    crop: str = Field(..., description="Crop type (e.g. wheat, rice, maize, sugarcane)")
    area_acres: float = Field(..., gt=0, description="Farm area in acres (must be > 0)")
    soil_type: str = Field(..., description="Soil type (e.g. alluvial, loamy, clayey, sandy, black)")
    current_irrigation_mm: float = Field(..., ge=0, description="Current planned or scheduled irrigation depth in mm")
    location: str = Field(..., min_length=2, description="Farm location/state (e.g. Uttar Pradesh, Punjab, Haryana)")
    rainfall_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Forecasted rainfall probability within next 24-48 hours (0.0 to 1.0)"
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
        supported = [s.value for s in SoilType]
        if normalized not in supported:
            # Fallback to loamy if close or let user know
            raise ValueError(
                f"Unsupported soil type '{v}'. Supported types are: {', '.join(supported)}"
            )
        return normalized


class IrrigationRecommendation(BaseModel):
    """Deterministic irrigation guidance."""
    recommended_irrigation_mm: float = Field(..., ge=0)
    status: str = Field(..., description="Operational status: e.g., 'Delay Irrigation', 'Irrigate Now', 'Optimal'")
    urgency: str = Field(..., description="Urgency level: 'Low', 'Medium', 'High', 'Critical'")
    action: str = Field(..., description="Direct tactical action for the farmer")
    soil_depletion_percent: float = Field(..., description="Calculated moisture deficit from field capacity")
    expected_rain_offset_mm: float = Field(..., description="Estimated effective rainfall offset")
    explanation: str = Field(..., description="Clear deterministic explanation of the recommendation")


class WaterAnalysis(BaseModel):
    """Water volume analysis and savings."""
    current_water_liters: float = Field(..., ge=0)
    recommended_water_liters: float = Field(..., ge=0)
    water_savings_liters: float = Field(...)
    water_savings_percent: float = Field(...)
    diesel_or_electricity_savings_hours: float = Field(
        ...,
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
        description="Estimated valorization value (bio-pellets, mulching benefits, compost)"
    )


class EnvironmentalImpact(BaseModel):
    """Environmental sustainability and carbon footprint metrics."""
    co2e_avoided_kg: float = Field(
        ...,
        description="Estimated CO2 equivalent emissions avoided by preventing residue burning"
    )
    pm25_avoided_kg: float = Field(
        ...,
        description="Particulate matter (PM2.5) emissions avoided"
    )
    water_saved_liters: float
    water_saved_cubic_meters: float
    soil_health_benefit: str


class FarmAnalysisResponse(BaseModel):
    """Complete aggregated farm analysis response."""
    farm_input: FarmInput
    irrigation_recommendation: IrrigationRecommendation
    water_analysis: WaterAnalysis
    residue_estimate: ResidueEstimate
    environmental_impact: EnvironmentalImpact
    notes: List[str] = Field(default_factory=list)
