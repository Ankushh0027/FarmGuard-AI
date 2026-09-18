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
        forecast_rainfall_mm=5.0,
        soil_moisture_percent=45.0,
    )
    assert farm.crop == "wheat"
    assert farm.area_acres == 2.0
    assert farm.soil_type == "alluvial"
    assert farm.current_irrigation_mm == 50.0
    assert farm.location == "Uttar Pradesh"
    assert farm.rainfall_probability == 0.15
    assert farm.forecast_rainfall_mm == 5.0
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
        forecast_rainfall_mm=0.0,
        soil_moisture_percent=40.0,
    )
    result = analyze_farm(farm)
    assert result.farm_input.crop == crop_name
    assert result.irrigation_recommendation.recommended_irrigation_mm >= 0.0
    assert result.water_analysis.current_water_liters > 0
    assert result.residue_estimate.estimated_residue_tonnes > 0
    assert result.environmental_impact.co2e_avoided_kg > 0
    assert len(result.assumptions) > 0


# ============================================================================
# 3. SCIENTIFICALLY HARDENED RAINFALL LOGIC TESTS
# ============================================================================

def test_rainfall_probability_without_forecast_rainfall_mm():
    """Test that high rain probability alone does NOT fabricate a rainfall amount."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="sandy loam",
        current_irrigation_mm=30.0,
        location="Uttar Pradesh",
        rainfall_probability=0.70,  # 70% probability
        forecast_rainfall_mm=None,  # Depth is unknown
        soil_moisture_percent=45.0,  # Target is 65%, deficit is 20%
    )
    rec = calculate_irrigation(farm)
    # Expected rain offset must be 0.0 (no fabricated rainfall depth!)
    assert rec.expected_rain_offset_mm == 0.0
    assert rec.recommended_irrigation_mm > 0.0
    assert "Check Local Forecast" in rec.status or "Moderate" in rec.status
    assert "unknown" in rec.action.lower() or "re-check" in rec.action.lower() or "verify" in rec.action.lower()


def test_forecast_rainfall_mm_greater_than_deficit():
    """Test that when actual forecast rain depth exceeds moisture deficit, irrigation is postponed."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="sandy loam",
        current_irrigation_mm=30.0,
        location="Uttar Pradesh",
        rainfall_probability=0.80,
        forecast_rainfall_mm=25.0,  # 25 mm forecast rain exceeds the deficit (~18 mm)
        soil_moisture_percent=45.0,
    )
    rec = calculate_irrigation(farm)
    assert rec.recommended_irrigation_mm == 0.0
    assert rec.expected_rain_offset_mm > 0.0
    assert "Postpone" in rec.status
    assert "25.0 mm" in rec.action or "25.0 mm" in rec.explanation


def test_forecast_rainfall_mm_less_than_deficit():
    """Test that when forecast rain is less than deficit, irrigation is reduced rather than eliminated."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.60,
        forecast_rainfall_mm=5.0,   # 5 mm forecast rain
        soil_moisture_percent=45.0,  # Deficit is 20% on 65% target -> raw req is ~15.4 mm
    )
    rec = calculate_irrigation(farm)
    # Net requirement should be raw req (~15.4 mm) - 5.0 mm = ~10.4 mm
    assert rec.recommended_irrigation_mm == pytest.approx(10.4, abs=0.5)
    assert rec.expected_rain_offset_mm == 5.0
    assert "Reduced Irrigation" in rec.status


def test_forecast_rainfall_zero():
    """Test zero forecast rainfall."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.0,
        forecast_rainfall_mm=0.0,
        soil_moisture_percent=45.0,
    )
    rec = calculate_irrigation(farm)
    assert rec.expected_rain_offset_mm == 0.0
    assert rec.recommended_irrigation_mm == pytest.approx(15.4, abs=0.5)


def test_no_unsupported_icar_pau_claims():
    """Verify that unsupported authoritative claims ('ICAR & PAU') are not present in responses."""
    farm = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=50.0,
        location="Uttar Pradesh",
        rainfall_probability=0.1,
        soil_moisture_percent=45.0,
    )
    result = analyze_farm(farm)
    full_output = str(result.model_dump())
    assert "ICAR & PAU guidelines" not in full_output
    assert "ICAR/PAU" not in full_output


# ============================================================================
# 4. AGENT TOOLS TESTS (app/tools/farm_tools.py)
# ============================================================================

def test_tool_get_crop_water_requirement_valid_and_invalid():
    """Test tool get_crop_water_requirement across crops and error handling."""
    res = tool_get_crop_water_req(crop="wheat", soil_type="sandy loam")
    assert res["crop"] == "wheat"
    assert res["base_irrigation_depth_mm"] == 50.0
    assert res["target_moisture_percent"] == 65.0
    assert res["soil_retention_factor"] == 0.85
    assert res["adjusted_irrigation_depth_mm"] > 0

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
        forecast_rainfall_mm=10.0,
    )
    assert "recommended_irrigation_mm" in res
    assert "status" in res
    assert "urgency" in res
    assert "explanation" in res
    assert res["recommended_irrigation_mm"] >= 0.0


def test_tool_calculate_water_savings_non_negative():
    """Test tool calculate_water_savings ensures savings are non-negative."""
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

    res_under = tool_calc_water_savings(
        crop="wheat",
        area_acres=2.0,
        soil_type="alluvial",
        current_irrigation_mm=10.0,
        recommended_irrigation_mm=40.0,
    )
    assert res_under["water_savings_liters"] == 0.0
    assert res_under["water_savings_percent"] == 0.0


def test_tool_calculate_crop_residue():
    """Test tool calculate_crop_residue."""
    res = tool_calc_crop_residue(crop="sugarcane", area_acres=4.0)
    assert res["crop"] == "sugarcane"
    assert res["area_acres"] == 4.0
    assert res["estimated_residue_tonnes"] == 14.0
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


def test_tool_analyze_farm_pipeline():
    """Test complete tool analyze_farm_pipeline."""
    res = tool_analyze_farm_pipeline(
        crop="wheat",
        area_acres=2.0,
        soil_type="sandy loam",
        current_irrigation_mm=30.0,
        location="Uttar Pradesh",
        rainfall_probability=0.70,
        forecast_rainfall_mm=15.0,
        soil_moisture_percent=64.0,
    )
    assert "farm_input" in res
    assert "irrigation_recommendation" in res
    assert "water_analysis" in res
    assert "residue_estimate" in res
    assert "environmental_impact" in res
    assert "assumptions" in res


# ============================================================================
# 5. API ENDPOINT INTEGRATION & DEMO SCENARIO TESTS
# ============================================================================

def test_api_health_endpoint():
    """Test GET /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "FarmGuard AI Backend" in data["service"]


def test_api_analyze_endpoint_with_forecast_rainfall():
    """Test POST /api/v1/farm/analyze with explicit forecast rainfall amount."""
    payload = {
        "crop": "wheat",
        "area_acres": 2,
        "soil_type": "sandy loam",
        "current_irrigation_mm": 30,
        "location": "Uttar Pradesh",
        "rainfall_probability": 70,
        "forecast_rainfall_mm": 15.0,
        "soil_moisture_percent": 64
    }
    response = client.post("/api/v1/farm/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["farm_input"]["crop"] == "wheat"
    assert data["farm_input"]["forecast_rainfall_mm"] == 15.0
    assert data["irrigation_recommendation"]["recommended_irrigation_mm"] == 0.0
    assert len(data["assumptions"]) > 0


def test_api_analyze_endpoint_invalid_payload():
    """Test POST /api/v1/farm/analyze with invalid payload returns 422."""
    bad_payload = {
        "crop": "wheat",
        "area_acres": -5.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 50.0,
        "location": "Uttar Pradesh",
        "rainfall_probability": 250.0,
        "soil_moisture_percent": 45.0
    }
    response = client.post("/api/v1/farm/analyze", json=bad_payload)
    assert response.status_code == 422
