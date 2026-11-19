"""Tests for Language Adaptation, Empathy, Context Retention, and Fallback Reliability.

Verifies:
- Hinglish detection and Roman-script conversational responses.
- Devanagari Hindi detection and natural Hindi responses.
- English detection and English responses.
- Explicit language preference overriding automatic detection.
- Multi-turn conversation history retention and growth-stage triage.
- Missing farm information handling and factual reliability.
- Provider failure graceful fallback across languages.
"""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from main import app
from app.agents.farm_agent import FarmGuardAgent
from app.models.farm import AgentAdviceRequest

client = TestClient(app)


# ============================================================================
# 1. LANGUAGE DETECTION & NATURAL CONVERSATIONAL RESPONSES
# ============================================================================

def test_hinglish_question_returns_natural_hinglish_response():
    """Hinglish query should be detected as hinglish and answered in natural Roman Hinglish."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Mere gehun ke khet mein paani kab dena chahiye?"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "hinglish"
    # Should address wheat irrigation timing directly in Hinglish
    assert any(term in res.answer.lower() for term in ["gehun", "gehu", "paani", "mitti", "irrigation", "cri"])
    # Should not start with robotic boilerplate
    assert "as an ai" not in res.answer.lower()
    assert "i am an artificial intelligence" not in res.answer.lower()


def test_hindi_devanagari_question_returns_hindi_response():
    """Devanagari query should be detected as hindi and answered in Hindi script."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="मेरे गेहूं के खेत में पानी कब लगाना चाहिए?"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "hindi"
    # Should include Hindi keywords
    assert any(term in res.answer for term in ["गेहूं", "पानी", "सिंचाई", "नमी", "खेत"])
    assert "as an ai" not in res.answer.lower()


def test_english_question_returns_english_response():
    """English query should be detected as english and answered in English."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="When is the best time to irrigate my wheat crop?"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "english"
    assert any(term in res.answer.lower() for term in ["wheat", "irrigation", "water", "soil", "crown"])
    assert "as an ai" not in res.answer.lower()


# ============================================================================
# 2. EXPLICIT LANGUAGE PREFERENCE OVERRIDE
# ============================================================================

def test_explicit_language_override_hinglish():
    """Explicit language 'hinglish' should override English message syntax."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="What is the benefit of biochar for soil?",
        language="hinglish"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "hinglish"
    # Conversational biochar response should be in Hinglish
    assert any(term in res.answer.lower() for term in ["biochar", "mitti", "khet", "nami", "organic"])


def test_explicit_language_override_hindi():
    """Explicit language 'hindi' should override English message syntax."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Can you explain mulching?",
        language="hindi"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "hindi"
    assert any(term in res.answer for term in ["मल्चिंग", "मिट्टी", "नमी", "फसल"])


def test_explicit_language_override_english():
    """Explicit language 'english' should override Hinglish message syntax."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Mere khet mein paani kab du?",
        language="english"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "english"
    assert "wheat" in res.answer.lower() or "irrigation" in res.answer.lower() or "crop" in res.answer.lower()


# ============================================================================
# 3. CONVERSATION CONTEXT & MULTI-TURN MEMORY
# ============================================================================

def test_multi_turn_growth_stage_follow_up():
    """Follow-up with sowing duration should leverage previous turn context."""
    agent = FarmGuardAgent()
    
    # Farmer previously asked about wheat irrigation
    history = [
        {"role": "user", "content": "Mere gehun ke khet mein paani kab dena chahiye?"},
        {
            "role": "assistant",
            "content": "Gehun mein paani ka time growth stage par depend karta hai. Boye kitne din ho gaye?"
        }
    ]
    
    req = AgentAdviceRequest(
        message="Boye lagbhag 22 din ho gaye hain aur mitti thodi sookh rahi hai.",
        history=history,
        language="hinglish"
    )
    res = agent.get_advice(req)

    # Should identify CRI (Crown Root Initiation, 20-25 days) stage
    assert res.detected_language == "hinglish"
    answer_lower = res.answer.lower()
    assert any(term in answer_lower for term in ["cri", "crown root", "20-25", "21-25", "pahli sinchai", "pehle irrigation"])


def test_multi_turn_retains_farm_crop_context():
    """If crop was specified in initial turn or farm context, follow-up retains it."""
    agent = FarmGuardAgent()
    
    req = AgentAdviceRequest(
        message="Acreage 2 acres hai, kitna paani lagega?",
        farm={"crop": "wheat", "location": "Punjab"},
        history=[
            {"role": "user", "content": "Mera gehun ka khet Punjab mein hai."}
        ],
        language="hinglish"
    )
    res = agent.get_advice(req)

    # Response should know the crop is wheat without re-asking what crop it is
    assert "wheat" in res.answer.lower() or "gehun" in res.answer.lower()


# ============================================================================
# 4. FULL FARM CONTEXT WITH DETERMINISTIC GROUNDING IN MULTIPLE LANGUAGES
# ============================================================================

def test_full_farm_analysis_hinglish_grounding():
    """Deterministic advice for full farm input in Hinglish retains FAO-56 grounding."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Kripya mere khet ka vishleshan karein.",
        farm={
            "crop": "wheat",
            "area_acres": 2.5,
            "soil_type": "sandy loam",
            "current_irrigation_mm": 25.0,
            "location": "Haryana",
            "rainfall_probability": 15,
            "soil_moisture_percent": 55.0,
        },
        language="hinglish"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "hinglish"
    assert res.numerical_results is not None
    assert "RECOMMENDATION" in res.answer
    assert "WATER IMPACT" in res.answer
    # Should have grounded numerical values
    assert "2.5" in str(res.numerical_results) or "2.5" in res.answer


def test_full_farm_analysis_hindi_grounding():
    """Deterministic advice for full farm input in Hindi retains FAO-56 grounding."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="कृपया मेरे खेत का विश्लेषण करें।",
        farm={
            "crop": "wheat",
            "area_acres": 1.0,
            "soil_type": "clay loam",
            "current_irrigation_mm": 20.0,
            "location": "Madhya Pradesh",
            "rainfall_probability": 10,
            "soil_moisture_percent": 60.0,
        },
        language="hindi"
    )
    res = agent.get_advice(req)

    assert res.detected_language == "hindi"
    assert res.numerical_results is not None
    assert "RECOMMENDATION" in res.answer
    assert any(term in res.answer for term in ["सिंचाई", "लीटर", "पानी", "सलाह"])


# ============================================================================
# 5. ERROR RESILIENCE & PROVIDER FALLBACK
# ============================================================================

def test_provider_synthesis_failure_falls_back_gracefully():
    """If Gemini synthesis throws or fails, agent returns verified deterministic fallback."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(
        message="Analyze my farm irrigation.",
        farm={
            "crop": "rice",
            "area_acres": 3.0,
            "soil_type": "clay",
            "current_irrigation_mm": 40.0,
            "location": "Punjab",
            "rainfall_probability": 10,
            "soil_moisture_percent": 50.0,
        },
        language="english"
    )

    with patch.object(agent, "_call_gemini_synthesis", return_value=None):
        res = agent.get_advice(req)

    # Must succeed gracefully without throwing 500
    assert res is not None
    assert "RECOMMENDATION" in res.answer
    assert res.numerical_results is not None
    assert res.detected_language == "english"


def test_empty_message_handled_gracefully():
    """Agent handles empty or whitespace message without 500 error."""
    agent = FarmGuardAgent()
    req = AgentAdviceRequest(message="   ")
    res = agent.get_advice(req)

    assert res is not None
    assert len(res.answer) > 0


# ============================================================================
# 6. FASTAPI ENDPOINT INTEGRATION
# ============================================================================

def test_api_v1_agent_advice_multilingual_endpoint():
    """POST /api/v1/agent/advice returns detected_language and valid response structure."""
    payload = {
        "message": "Mera dhaan ka khet hai, paani kitna chahiye?",
        "language": "hinglish",
        "history": []
    }
    response = client.post("/api/v1/agent/advice", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert data["detected_language"] == "hinglish"
    assert len(data["answer"]) > 10
