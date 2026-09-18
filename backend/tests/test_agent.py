"""Comprehensive test suite for FarmGuard AI Gemini Agent, Live Weather, and Tool Orchestration."""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from main import app
from app.agents.farm_agent import FarmGuardAgent
from app.models.farm import AgentAdviceRequest, FarmInput

client = TestClient(app)


# ============================================================================
# 1. AGENT UNIT TESTS
# ============================================================================

def test_agent_valid_farm_advice_request_with_weather_tool():
    """Test agent processes a complete farm input, invokes weather tool, and returns structured sections."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Please analyze my farm in Uttar Pradesh.",
        farm={
            "crop": "wheat",
            "area_acres": 2.0,
            "soil_type": "sandy loam",
            "current_irrigation_mm": 30.0,
            "location": "Uttar Pradesh",
            "rainfall_probability": 70,
            "soil_moisture_percent": 64.0,
        }
    )
    res = agent.get_advice(req)
    assert res.missing_fields is None
    # All tools including get_weather_forecast should be in the trace
    assert len(res.tool_trace) >= 5
    tools_in_trace = [t.tool for t in res.tool_trace]
    assert "get_weather_forecast" in tools_in_trace
    assert "calculate_irrigation" in tools_in_trace
    assert res.numerical_results is not None

    # Check that key sections exist in synthesized answer
    assert "RECOMMENDATION" in res.answer
    assert "WATER IMPACT" in res.answer
    assert "CROP RESIDUE" in res.answer
    assert "ENVIRONMENTAL IMPACT" in res.answer
    assert "WHY" in res.answer
    assert "ASSUMPTIONS" in res.answer

    # Check structured assumptions categorization
    assump_types = [a.type for a in res.assumptions]
    assert "weather" in assump_types
    assert "agronomic_model" in assump_types
    assert "environmental_impact" in assump_types


def test_agent_missing_farm_information():
    """Test agent prompts for missing parameters when insufficient info is given."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Should I irrigate my wheat field?"
    )
    res = agent.get_advice(req)
    assert res.missing_fields is not None
    assert len(res.missing_fields) > 0
    assert "Please provide" in res.answer
    assert res.numerical_results is None
    assert len(res.tool_trace) == 0


def test_agent_partial_information_extraction():
    """Test agent extracts parameters from message and identifies remainder missing."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="I have 2 acres of wheat in Uttar Pradesh."
    )
    res = agent.get_advice(req)
    assert res.missing_fields is not None
    assert "soil_moisture_percent" in res.missing_fields
    assert "crop" not in res.missing_fields


def test_numerical_values_originate_from_tools():
    """Verify that numerical outputs in response originate strictly from the tool layer."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        farm={
            "crop": "wheat",
            "area_acres": 2.0,
            "soil_type": "sandy loam",
            "current_irrigation_mm": 30.0,
            "location": "Uttar Pradesh",
            "rainfall_probability": 0.15,
            "forecast_rainfall_mm": 0.0,
            "soil_moisture_percent": 45.0,
        }
    )
    res = agent.get_advice(req)
    num_res = res.numerical_results
    assert num_res["irrigation_recommendation"]["recommended_irrigation_mm"] > 0
    assert num_res["residue_estimate"]["estimated_residue_tonnes"] == 3.8
    assert num_res["water_analysis"]["water_savings_liters"] >= 0
    assert res.recommendation["recommended_irrigation_mm"] == num_res["irrigation_recommendation"]["recommended_irrigation_mm"]


def test_zero_mm_irrigation_wording_constraint():
    """Test that 0mm irrigation is framed as a prototype recommendation rather than absolute certainty."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        farm={
            "crop": "wheat",
            "area_acres": 2.0,
            "soil_type": "sandy loam",
            "current_irrigation_mm": 30.0,
            "location": "Uttar Pradesh",
            "rainfall_probability": 0.85,
            "forecast_rainfall_mm": 20.0,  # 20mm forecast rain -> 0mm recommended
            "soil_moisture_percent": 64.0,
        }
    )
    res = agent.get_advice(req)
    assert "definitely do not need" not in res.answer.lower()
    assert "recommends postponing" in res.answer.lower() or "prototype model" in res.answer.lower()


def test_gemini_api_call_and_mock():
    """Test Gemini SDK invocation with mocked Client."""
    agent = FarmGuardAgent(api_key="fake-test-key")
    farm_input = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="sandy loam",
        current_irrigation_mm=30.0,
        location="Uttar Pradesh",
        rainfall_probability=0.7,
        forecast_rainfall_mm=10.0,
        soil_moisture_percent=64.0,
    )
    num_res, _, active_input = agent._execute_tools(farm_input)

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = (
            "### RECOMMENDATION\n- Postpone irrigation.\n\n"
            "### WEATHER CONTEXT\n- 10.0 mm forecast rain.\n\n"
            "### WATER IMPACT\n- Saved 242,811 Liters\n\n"
            "### CROP RESIDUE\n- 3.8 Tonnes\n\n"
            "### ENVIRONMENTAL IMPACT\n- 5,548 kg CO2e\n\n"
            "### WHY\n- Rain expected.\n\n"
            "### ASSUMPTIONS\n- Prototype estimates."
        )
        mock_instance.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        answer = agent._call_gemini_synthesis(active_input, num_res, "test query")
        assert "RECOMMENDATION" in answer
        assert "WATER IMPACT" in answer
        assert mock_instance.models.generate_content.called


def test_gemini_api_failure_graceful_fallback():
    """Test that agent falls back to deterministic synthesis gracefully if Gemini API errors."""
    agent = FarmGuardAgent(api_key="fake-failing-key")
    farm_input = FarmInput(
        crop="wheat",
        area_acres=2.0,
        soil_type="sandy loam",
        current_irrigation_mm=30.0,
        location="Uttar Pradesh",
        rainfall_probability=0.7,
        forecast_rainfall_mm=5.0,
        soil_moisture_percent=64.0,
    )
    num_res, _, active_input = agent._execute_tools(farm_input)

    with patch("google.genai.Client", side_effect=Exception("API Connection Timeout")):
        answer = agent._call_gemini_synthesis(active_input, num_res, "test query")
        assert "RECOMMENDATION" in answer
        assert "WATER IMPACT" in answer
        assert "ASSUMPTIONS" in answer


def test_no_secret_leak_in_response_or_errors():
    """Test that API keys or credentials are never leaked in responses."""
    secret_key = "AIzaSySecretApiKey123456789"
    agent = FarmGuardAgent(api_key=secret_key)
    req = AgentAdviceRequest(
        farm={
            "crop": "wheat",
            "area_acres": 2.0,
            "soil_type": "sandy loam",
            "current_irrigation_mm": 30.0,
            "location": "Uttar Pradesh",
            "rainfall_probability": 0.7,
            "soil_moisture_percent": 64.0,
        }
    )
    res = agent.get_advice(req)
    res_str = str(res.model_dump())
    assert secret_key not in res_str
    assert "SecretApiKey" not in res_str


# ============================================================================
# 2. API ENDPOINT TESTS: POST /api/v1/agent/advice
# ============================================================================

def test_api_agent_advice_endpoint_complete_payload():
    """Test POST /api/v1/agent/advice with Phase 3 demo scenario."""
    payload = {
        "message": "I have a 2-acre wheat farm in Uttar Pradesh.",
        "farm": {
            "crop": "wheat",
            "area_acres": 2,
            "soil_type": "sandy loam",
            "current_irrigation_mm": 30,
            "location": "Uttar Pradesh",
            "rainfall_probability": 70,
            "soil_moisture_percent": 64
        }
    }
    response = client.post("/api/v1/agent/advice", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "answer" in data
    assert "recommendation" in data
    assert "tool_trace" in data
    assert len(data["tool_trace"]) >= 5
    assert "numerical_results" in data
    assert "assumptions" in data
    assert len(data["assumptions"]) > 0


def test_api_agent_advice_endpoint_missing_info():
    """Test POST /api/v1/agent/advice when only incomplete question is sent."""
    payload = {
        "message": "Should I irrigate my maize field?"
    }
    response = client.post("/api/v1/agent/advice", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["missing_fields"] is not None
    assert "Please provide" in data["answer"]
    assert data["numerical_results"] is None
