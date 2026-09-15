"""FastAPI API routes for FarmGuard AI."""

from fastapi import APIRouter, status, HTTPException
from app.models.farm import (
    FarmInput,
    FarmAnalysisResponse,
    AgentAdviceRequest,
    AgentAdviceResponse,
)
from app.calculations.farm_calculator import analyze_farm
from app.agents.farm_agent import FarmGuardAgent

router = APIRouter()
agent_service = FarmGuardAgent()


@router.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
def health_check():
    """Health check endpoint for service status verification."""
    return {
        "status": "ok",
        "service": "FarmGuard AI Backend",
        "version": "0.1.0",
        "phase": "Phase 3 - Gemini Agent & Deterministic Tool Orchestration"
    }


@router.post(
    "/api/v1/farm/analyze",
    response_model=FarmAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Farm Advisory"]
)
def analyze_farm_endpoint(farm_input: FarmInput):
    """Analyze farm parameters and return deterministic irrigation, water conservation,

    crop residue management, and environmental impact assessments.
    """
    try:
        response = analyze_farm(farm_input)
        return response
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during farm calculation: {str(err)}"
        )


@router.post(
    "/api/v1/agent/advice",
    response_model=AgentAdviceResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Agent Advisory"]
)
def agent_advice_endpoint(request: AgentAdviceRequest):
    """Consult the FarmGuard AI Agent for tool-orchestrated, explainable farming advice."""
    try:
        response = agent_service.get_advice(request)
        return response
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent advisory service encounter an error: {str(err)}"
        )
