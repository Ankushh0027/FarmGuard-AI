"""Comprehensive test suite for FarmGuard AI Gemini Agent and Tool Orchestration."""

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

def test_agent_valid_farm_advice_request():
    """Test agent processes a complete structured farm input and returns structured sections."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Please analyze my farm.",
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
    assert len(res.tool_trace) == 5
    assert res.numerical_results is not None

    # Check that key sections exist in synthesized answer
    assert "RECOMMENDATION" in res.answer
    assert "WATER IMPACT" in res.answer
    assert "CROP RESIDUE" in res.answer
    assert "ENVIRONMENTAL IMPACT" in res.answer
    assert "WHY" in res.answer
    assert "ASSUMPTIONS" in res.answer


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
    # Crop, area, location were extracted, but soil moisture & irrigation are missing
    assert "soil_moisture_percent" in res.missing_fields
    assert "crop" not in res.missing_fields


def test_agent_tool_execution_trace():
    """Test that all 5 deterministic tools are called and traced."""
    agent = FarmGuardAgent()
    farm_input = FarmInput(
        crop="rice",
        area_acres=3.0,
        soil_type="clayey",
        current_irrigation_mm=75.0,
        location="Punjab",
        rainfall_probability=0.2,
        soil_moisture_percent=55.0,
    )
    num_res, trace = agent._execute_tools(farm_input)
    assert len(trace) == 5
    tools_called = [t.tool for t in trace]
    assert "get_crop_water_requirement" in tools_called
    assert "calculate_irrigation" in tools_called
    assert "calculate_water_savings" in tools_called
    assert "calculate_crop_residue" in tools_called
    assert "calculate_environmental_impact" in tools_called
    assert all(t.status == "completed" for t in trace)


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
            "rainfall_probability": 0.85,  # High rain -> 0mm recommended
            "soil_moisture_percent": 64.0,
        }
    )
    res = agent.get_advice(req)
    # Ensure it doesn't say "You definitely do not need irrigation"
    assert "definitely do not need" not in res.answer.lower()
    # Must explicitly state prototype recommendation / assumptions
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
        soil_moisture_percent=64.0,
    )
    num_res, _ = agent._execute_tools(farm_input)

    # Mock the google.genai Client
    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = (
            "### RECOMMENDATION\n- Postpone irrigation.\n\n"
            "### WATER IMPACT\n- Saved 242,811 Liters\n\n"
            "### CROP RESIDUE\n- 3.8 Tonnes\n\n"
            "### ENVIRONMENTAL IMPACT\n- 5,548 kg CO2e\n\n"
            "### WHY\n- Rain expected.\n\n"
            "### ASSUMPTIONS\n- Prototype estimates."
        )
        mock_instance.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        answer = agent._call_gemini_synthesis(farm_input, num_res, "test query")
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
        soil_moisture_percent=64.0,
    )
    num_res, _ = agent._execute_tools(farm_input)

    with patch("google.genai.Client", side_effect=Exception("API Connection Timeout")):
        answer = agent._call_gemini_synthesis(farm_input, num_res, "test query")
        # Should gracefully return structured deterministic advisory without raising error
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
    assert len(data["tool_trace"]) == 5
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
