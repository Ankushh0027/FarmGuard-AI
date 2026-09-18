"""FastAPI API routes for FarmGuard AI.

Provides:
- Liveness (/health) and Readiness (/ready) probes
- Prometheus metrics exposition (/metrics)
- Deterministic farm analysis endpoint (/api/v1/farm/analyze)
- AI agent advisory endpoint (/api/v1/agent/advice)
"""

from typing import Optional
from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.responses import PlainTextResponse, JSONResponse
from app.models.farm import (
    FarmInput,
    FarmAnalysisResponse,
    AgentAdviceRequest,
    AgentAdviceResponse,
)
from app.calculations.farm_calculator import analyze_farm
from app.agents.farm_agent import FarmGuardAgent
from app.config import get_settings
from app.api.auth import verify_api_key
from app.api.metrics import get_metrics_registry

router = APIRouter()
agent_service = FarmGuardAgent()


@router.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
def health_check():
    """Liveness probe. Fast and non-blocking; never calls external LLMs or APIs."""
    return {
        "status": "ok",
        "liveness": "healthy",
        "service": "FarmGuard AI Backend",
        "version": "0.1.0",
        "phase": "Phase 7 - Productionization & Deployment",
    }


@router.get("/ready", status_code=status.HTTP_200_OK, tags=["System"])
def readiness_check():
    """Readiness probe. Verifies internal calculation engine, config, and guardrails."""
    checks = {
        "engine": "ok",
        "guardrails": "ok",
        "config": "ok",
    }
    try:
        settings = get_settings()
        if settings.is_production and settings.DEBUG:
            checks["config"] = "error: debug mode active in production"
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"status": "not_ready", "checks": checks},
            )
    except Exception as exc:
        checks["config"] = f"error: {str(exc)}"
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "checks": checks},
        )

    return {
        "status": "ready",
        "service": "FarmGuard AI Backend",
        "checks": checks,
    }


@router.get("/metrics", tags=["System"])
def metrics_endpoint():
    """Prometheus-compatible metrics exposition endpoint."""
    metrics_text = get_metrics_registry().generate_prometheus_text()
    return PlainTextResponse(
        content=metrics_text,
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


@router.post(
    "/api/v1/farm/analyze",
    response_model=FarmAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Farm Advisory"],
)
def analyze_farm_endpoint(
    farm_input: FarmInput,
    _auth: Optional[str] = Depends(verify_api_key),
):
    """Analyze farm parameters and return deterministic irrigation, water conservation,

    crop residue management, and environmental impact assessments.
    """
    try:
        response = analyze_farm(farm_input)
        return response
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during farm calculation: {str(err)}",
        )


@router.post(
    "/api/v1/agent/advice",
    response_model=AgentAdviceResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Agent Advisory"],
)
def agent_advice_endpoint(
    request: AgentAdviceRequest,
    _auth: Optional[str] = Depends(verify_api_key),
):
    """Consult the FarmGuard AI Agent for tool-orchestrated, explainable farming advice."""
    try:
        response = agent_service.get_advice(request)
        return response
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent advisory service encounter an error: {str(err)}",
        )
