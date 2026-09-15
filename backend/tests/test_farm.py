"""Comprehensive test suite for FarmGuard AI Phase 1 backend and calculation engine."""

import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient

from main import app
from app.models.farm import FarmInput
from app.calculations.farm_calculator import (
    calculate_irrigation,
    calculate_water_savings,
    calculate_crop_residue,
    calculate_environmental_impact,
    analyze_farm,
    LITERS_PER_ACRE_MM,
)

client = TestClient(app)


# ============================================================================
# 1. MODEL VALIDATION TESTS
# ============================================================================

def test_valid_farm_input():
    """Test valid farm input creation for the 2-acre wheat demo scenario."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.15,
        soil_moisture_percent=45.0,
    )
    assert farm.crop == "wheat"
    assert farm.area_acres == 2.0
    assert farm.soil_type == "alluvial"
    assert farm.current_irrigation_mm == 50.0
    assert farm.location == "Uttar Pradesh"
    assert farm.rainfall_probability == 0.15
    assert farm.soil_moisture_percent == 45.0


def test_invalid_area_negative_or_zero():
    """Test that zero or negative area_acres raises a ValidationError."""
    with pytest.raises(ValidationError):
        FarmInput(
            crop="wheat",
            area_acres=0.0,
            soil_type="alluvial",
            current_irrigation_mm=50.0,
            location="Uttar Pradesh",
            rainfall_probability=0.2,
            soil_moisture_percent=50.0,
        )

    with pytest.raises(ValidationError):
        FarmInput(
            crop="wheat",
            area_acres=-2.5,
            soil_type="alluvial",
            current_irrigation_mm=50.0,
            location="Uttar Pradesh",
            rainfall_probability=0.2,
            soil_moisture_percent=50.0,
        )


def test_invalid_rainfall_probability():
    """Test that rainfall probability < 0.0 or > 1.0 raises a ValidationError."""
    with pytest.raises(ValidationError):
        FarmInput(
            crop="wheat",
            area_acres=2.0,
            soil_type="alluvial",
            current_irrigation_mm=50.0,
            location="Uttar Pradesh",
            rainfall_probability=-0.1,
            soil_moisture_percent=50.0,
        )

    with pytest.raises(ValidationError):
        FarmInput(
            crop="wheat",
            area_acres=2.0,
            soil_type="alluvial",
            current_irrigation_mm=50.0,
            location="Uttar Pradesh",
            rainfall_probability=1.5,
            soil_moisture_percent=50.0,
        )


def test_invalid_crop_type():
    """Test that unsupported crop raises a ValidationError."""
    with pytest.raises(ValidationError):
        FarmInput(
            crop="dragonfruit",
            area_acres=2.0,
            soil_type="alluvial",
            current_irrigation_mm=50.0,
            location="Uttar Pradesh",
            rainfall_probability=0.2,
            soil_moisture_percent=50.0,
        )


# ============================================================================
# 2. DETERMINISTIC CALCULATION ENGINE TESTS
# ============================================================================

def test_irrigation_calculation_wheat_demo():
    """Test irrigation calculation for the 2-acre wheat farm demo in UP."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.10,
        soil_moisture_percent=45.0,  # Target is 65.0%, deficit is 20.0%
    )
    rec = calculate_irrigation(farm)
    assert rec.recommended_irrigation_mm > 0
    assert rec.recommended_irrigation_mm <= 50.0
    assert rec.soil_depletion_percent == 20.0
    assert rec.urgency in ["Low", "Medium", "High", "Critical"]
    assert "wheat" in rec.explanation.lower()


def test_irrigation_calculation_high_rainfall_postponement():
    """Test that high rainfall probability postpones or reduces irrigation."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.85,  # 85% rain expected
        soil_moisture_percent=55.0,  # Target is 65% (deficit is only 10%)
    )
    rec = calculate_irrigation(farm)
    assert rec.recommended_irrigation_mm == 0.0
    assert "Postpone" in rec.status or "Optimal" in rec.status


def test_irrigation_calculation_soil_moisture_already_adequate():
    """Test that adequate soil moisture results in 0 recommended irrigation."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.1,
        soil_moisture_percent=70.0,  # Target is 65%
    )
    rec = calculate_irrigation(farm)
    assert rec.recommended_irrigation_mm == 0.0
    assert rec.soil_depletion_percent == 0.0
    assert "Optimal" in rec.status


def test_water_savings_calculation():
    """Test exact volumetric water calculation and savings."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.2,
        soil_moisture_percent=45.0,
    )
    recommended_mm = 15.0
    water = calculate_water_savings(farm, recommended_mm=recommended_mm)

    expected_current_liters = round(50.0 * 2.0 * LITERS_PER_ACRE_MM, 1)
    expected_recommended_liters = round(15.0 * 2.0 * LITERS_PER_ACRE_MM, 1)
    expected_savings_liters = round(expected_current_liters - expected_recommended_liters, 1)

    assert water.current_water_liters == expected_current_liters
    assert water.recommended_water_liters == expected_recommended_liters
    assert water.water_savings_liters == expected_savings_liters
    assert water.water_savings_percent == 70.0
    assert water.diesel_or_electricity_savings_hours > 0


def test_crop_residue_calculation():
    """Test crop residue estimate and anti-stubble-burning recommendations."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.2,
        soil_moisture_percent=50.0,
    )
    residue = calculate_crop_residue(farm)
    assert residue.estimated_residue_tonnes == 3.8  # 2 acres * 1.9 tonnes/acre
    assert residue.crop == "wheat"
    assert residue.stubble_burning_risk == "High"
    assert len(residue.recommended_practices) > 0
    assert residue.economic_potential_inr > 0


def test_environmental_impact_calculation():
    """Test CO2e avoidance and PM2.5 calculation."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.2,
        soil_moisture_percent=50.0,
    )
    water_analysis = calculate_water_savings(farm, recommended_mm=20.0)
    residue_estimate = calculate_crop_residue(farm)
    env = calculate_environmental_impact(farm, water_analysis, residue_estimate)

    assert env.co2e_avoided_kg > 0
    assert env.pm25_avoided_kg > 0
    assert env.water_saved_liters == water_analysis.water_savings_liters
    assert env.water_saved_cubic_meters == round(water_analysis.water_savings_liters / 1000.0, 2)


# ============================================================================
# 3. API ENDPOINT INTEGRATION TESTS
# ============================================================================

def test_api_health_endpoint():
    """Test GET /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "FarmGuard AI Backend" in data["service"]


def test_api_analyze_endpoint_demo_scenario():
    """Test POST /api/v1/farm/analyze with 2-acre wheat farm in UP."""
    payload = {
        "crop": "wheat",
        "area_acres": 2.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Uttar Pradesh",
        "rainfall_probability": 0.15,
        "soil_moisture_percent": 45.0
    }
    response = client.post("/api/v1/farm/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify response structure
    assert "farm_input" in data
    assert "irrigation_recommendation" in data
    assert "water_analysis" in data
    assert "residue_estimate" in data
    assert "environmental_impact" in data

    # Verify demo values
    assert data["farm_input"]["crop"] == "wheat"
    assert data["farm_input"]["area_acres"] == 2.0
    assert data["residue_estimate"]["estimated_residue_tonnes"] == 3.8
    assert data["water_analysis"]["current_water_liters"] == round(50.0 * 2.0 * LITERS_PER_ACRE_MM, 1)


def test_api_analyze_endpoint_invalid_payload():
    """Test POST /api/v1/farm/analyze with invalid payload returns 422."""
    bad_payload = {
        "crop": "wheat",
        "area_acres": -5.0,  # Invalid area
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Uttar Pradesh",
        "rainfall_probability": 2.5,  # Invalid probability
        "soil_moisture_percent": 45.0
    }
    response = client.post("/api/v1/farm/analyze", json=bad_payload)
    assert response.status_code == 422
