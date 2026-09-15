"""Comprehensive test suite for FarmGuard AI deterministic calculation engine and agent tools."""

import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient

from main import app
from app.models.farm import FarmInput
from app.calculations.farm_calculator import (
    get_crop_water_requirement,
    calculate_irrigation,
    calculate_water_savings,
    calculate_crop_residue,
    calculate_environmental_impact,
    analyze_farm,
    LITERS_PER_ACRE_MM,
)
from app.tools.farm_tools import (
    get_crop_water_requirement as tool_get_crop_water_req,
    calculate_irrigation as tool_calc_irrigation,
    calculate_water_savings as tool_calc_water_savings,
    calculate_crop_residue as tool_calc_crop_residue,
    calculate_environmental_impact as tool_calc_env_impact,
    analyze_farm_pipeline as tool_analyze_farm_pipeline,
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
    """Test that rainfall probability < 0.0 or > 100% raises a ValidationError."""
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
            rainfall_probability=150.0,
            soil_moisture_percent=50.0,
        )


def test_percentage_rainfall_probability_normalization():
    """Test that percentage inputs like 70 or 70.0 normalize to 0.70."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="sandy loam",
        current_irrigation_mm=30.0,
        location="Uttar Pradesh",
        rainfall_probability=70,  # 70% input
        soil_moisture_percent=64.0,
    )
    assert farm.rainfall_probability == 0.70
    assert farm.soil_type == "sandy loam"


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
# 2. ALL SUPPORTED CROPS TESTS (Wheat, Rice, Maize, Sugarcane)
# ============================================================================

@pytest.mark.parametrize("crop_name", ["wheat", "rice", "maize", "sugarcane"])
def test_all_supported_crops_pipeline(crop_name):
    """Verify calculation engine and tools execute cleanly for all 4 supported crops."""
    farm = FarmInput(
        crop=crop_name,
        area_acres=3.0,
        soil_type="loamy",
        current_irrigation_mm=60.0,
        location="Punjab",
        rainfall_probability=0.1,
        soil_moisture_percent=40.0,
    )
    result = analyze_farm(farm)
    assert result.farm_input.crop == crop_name
    assert result.irrigation_recommendation.recommended_irrigation_mm >= 0.0
    assert result.water_analysis.current_water_liters > 0
    assert result.residue_estimate.estimated_residue_tonnes > 0
    assert result.environmental_impact.co2e_avoided_kg > 0


# ============================================================================
# 3. AGENT TOOLS TESTS (app/tools/farm_tools.py)
# ============================================================================

def test_tool_get_crop_water_requirement_valid_and_invalid():
    """Test tool get_crop_water_requirement across crops and error handling."""
    res = tool_get_crop_water_req(crop="wheat", soil_type="sandy loam")
    assert res["crop"] == "wheat"
    assert res["base_irrigation_depth_mm"] == 50.0
    assert res["target_moisture_percent"] == 65.0
    assert res["soil_retention_factor"] == 0.85
    assert res["adjusted_irrigation_depth_mm"] > 0

    # Test invalid crop in tool
    with pytest.raises(ValueError):
        tool_get_crop_water_req(crop="avocado")


def test_tool_calculate_irrigation():
    """Test tool calculate_irrigation function."""
    res = tool_calc_irrigation(
        crop="rice",
        area_acres=2.5,
        soil_type="clayey",
        current_irrigation_mm=80.0,
        location="Haryana",
        rainfall_probability=0.2,
        soil_moisture_percent=50.0,
    )
    assert "recommended_irrigation_mm" in res
    assert "status" in res
    assert "urgency" in res
    assert "explanation" in res
    assert res["recommended_irrigation_mm"] >= 0.0


def test_tool_calculate_water_savings_non_negative():
    """Test tool calculate_water_savings ensures savings are non-negative."""
    # When current is greater than recommended
    res = tool_calc_water_savings(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        recommended_irrigation_mm=15.0,
    )
    assert res["water_savings_liters"] > 0
    assert res["water_savings_percent"] == 70.0
    assert res["diesel_or_electricity_savings_hours"] > 0

    # When recommended is greater than current (under-irrigated previously)
    res_under = tool_calc_water_savings(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=10.0,
        recommended_irrigation_mm=40.0,
    )
    assert res_under["water_savings_liters"] == 0.0
    assert res_under["water_savings_percent"] == 0.0
    assert res_under["diesel_or_electricity_savings_hours"] == 0.0


def test_tool_calculate_crop_residue():
    """Test tool calculate_crop_residue."""
    res = tool_calc_crop_residue(crop="sugarcane", area_acres=4.0)
    assert res["crop"] == "sugarcane"
    assert res["area_acres"] == 4.0
    assert res["estimated_residue_tonnes"] == 14.0  # 4 * 3.5
    assert len(res["recommended_practices"]) > 0
    assert res["economic_potential_inr"] > 0


def test_tool_calculate_environmental_impact():
    """Test tool calculate_environmental_impact."""
    res = tool_calc_env_impact(
        crop="maize",
        area_acres=3.0,
        current_irrigation_mm=45.0,
        recommended_irrigation_mm=15.0,
    )
    assert res["co2e_avoided_kg"] > 0
    assert res["pm25_avoided_kg"] > 0
    assert res["water_saved_liters"] > 0
    assert res["water_saved_cubic_meters"] > 0
    assert "maize" in res["soil_health_benefit"].lower()


def test_tool_analyze_farm_pipeline():
    """Test complete tool analyze_farm_pipeline."""
    res = tool_analyze_farm_pipeline(
        crop="wheat",
        area_acres=2.0,
        soil_type="sandy loam",
        current_irrigation_mm=30.0,
        location="Uttar Pradesh",
        rainfall_probability=0.70,
        soil_moisture_percent=64.0,
    )
    assert "farm_input" in res
    assert "irrigation_recommendation" in res
    assert "water_analysis" in res
    assert "residue_estimate" in res
    assert "environmental_impact" in res


# ============================================================================
# 4. API ENDPOINT INTEGRATION & DEMO SCENARIO TESTS
# ============================================================================

def test_api_health_endpoint():
    """Test GET /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "FarmGuard AI Backend" in data["service"]


def test_api_analyze_endpoint_phase2_demo_payload():
    """Test POST /api/v1/farm/analyze with exact Phase 2 demo payload."""
    payload = {
        "crop": "wheat",
        "area_acres": 2,
        "soil_type": "sandy loam",
        "current_irrigation_mm": 30,
        "location": "Uttar Pradesh",
        "rainfall_probability": 70,
        "soil_moisture_percent": 64
    }
    response = client.post("/api/v1/farm/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Validations on demo response
    assert data["farm_input"]["crop"] == "wheat"
    assert data["farm_input"]["area_acres"] == 2.0
    assert data["farm_input"]["rainfall_probability"] == 0.7
    assert data["irrigation_recommendation"]["recommended_irrigation_mm"] == 0.0  # High rain + near optimal
    assert data["residue_estimate"]["estimated_residue_tonnes"] == 3.8
    assert data["water_analysis"]["water_savings_liters"] == round(30.0 * 2.0 * LITERS_PER_ACRE_MM, 1)


def test_api_analyze_endpoint_invalid_payload():
    """Test POST /api/v1/farm/analyze with invalid payload returns 422."""
    bad_payload = {
        "crop": "wheat",
        "area_acres": -5.0,  # Invalid area
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Uttar Pradesh",
        "rainfall_probability": 250.0,  # Invalid probability
        "soil_moisture_percent": 45.0
    }
    response = client.post("/api/v1/farm/analyze", json=bad_payload)
    assert response.status_code == 422
