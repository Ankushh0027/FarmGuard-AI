"""FastAPI API routes for FarmGuard AI.

Provides:
- Liveness (/health) and Readiness (/ready) probes
- Prometheus metrics exposition (/metrics)
- Deterministic farm analysis endpoint (/api/v1/farm/analyze)
- AI agent advisory endpoint (/api/v1/agent/advice)
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, status, HTTPException, Depends, Query
from fastapi.responses import PlainTextResponse, JSONResponse
from app.models.farm import (
    FarmInput,
    FarmAnalysisResponse,
    AgentAdviceRequest,
    AgentAdviceResponse,
    FarmModel,
    FarmCreateRequest,
    FarmUpdateRequest,
)
from app.calculations.farm_calculator import analyze_farm
from app.agents.farm_agent import FarmGuardAgent
from app.config import get_settings
from app.api.auth import verify_api_key
from app.api.metrics import get_metrics_registry
from app.services.farm_storage import (
    get_all_farms,
    get_farm_by_id,
    create_farm,
    update_farm,
    delete_farm,
    reset_farms_to_default,
)
from app.services.weather_service import fetch_weather_forecast

router = APIRouter()
agent_service = FarmGuardAgent()


@router.get("/", status_code=status.HTTP_200_OK, tags=["System"])
def root_endpoint():
    """Root metadata endpoint for FarmGuard AI Backend."""
    return {
        "service": "FarmGuard AI Backend",
        "tagline": "India-specific AI-powered sustainable farming assistant (NextStep Hacks 2026 - Earth Forward)",
        "version": "0.1.0",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "ready": "/ready",
            "metrics": "/metrics",
            "docs": "/docs",
            "farm_analysis": "/api/v1/farm/analyze",
            "agent_advice": "/api/v1/agent/advice"
        }
    }


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


# ============================================================================
# PERSISTENT FARM FIELD & GEOLOCATION ENDPOINTS
# ============================================================================

@router.get(
    "/api/v1/farms",
    response_model=List[FarmModel],
    status_code=status.HTTP_200_OK,
    tags=["Farms & Geolocation"],
)
def list_farms_endpoint():
    """Retrieve all registered farm plots with GPS coordinates and boundaries."""
    return get_all_farms()


@router.get(
    "/api/v1/farms/{farm_id}",
    response_model=FarmModel,
    status_code=status.HTTP_200_OK,
    tags=["Farms & Geolocation"],
)
def get_farm_endpoint(farm_id: str):
    """Retrieve a single farm by ID."""
    farm = get_farm_by_id(farm_id)
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm plot '{farm_id}' not found.",
        )
    return farm


@router.post(
    "/api/v1/farms",
    response_model=FarmModel,
    status_code=status.HTTP_201_CREATED,
    tags=["Farms & Geolocation"],
)
def create_farm_endpoint(req: FarmCreateRequest):
    """Register and persist a new farm field with GPS coordinates and boundary polygon."""
    return create_farm(req)


@router.put(
    "/api/v1/farms/{farm_id}",
    response_model=FarmModel,
    status_code=status.HTTP_200_OK,
    tags=["Farms & Geolocation"],
)
def update_farm_endpoint(farm_id: str, req: FarmUpdateRequest):
    """Update field details, GPS coordinates, or boundary polygon."""
    updated = update_farm(farm_id, req)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm plot '{farm_id}' not found.",
        )
    return updated


@router.delete(
    "/api/v1/farms/{farm_id}",
    status_code=status.HTTP_200_OK,
    tags=["Farms & Geolocation"],
)
def delete_farm_endpoint(farm_id: str):
    """Delete a farm plot from persistent storage."""
    success = delete_farm(farm_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm plot '{farm_id}' not found.",
        )
    return {"status": "deleted", "id": farm_id}


@router.post(
    "/api/v1/farms/reset",
    response_model=List[FarmModel],
    status_code=status.HTTP_200_OK,
    tags=["Farms & Geolocation"],
)
def reset_farms_endpoint():
    """Reset persistent farm database to default benchmark farms."""
    return reset_farms_to_default()


# ============================================================================
# WEATHER ENDPOINTS (DIRECT COORDINATES SUPPORT)
# ============================================================================

@router.get(
    "/api/v1/weather/forecast",
    status_code=status.HTTP_200_OK,
    tags=["Weather"],
)
def get_weather_forecast_endpoint(
    location: Optional[str] = Query("Uttar Pradesh", description="Location/State name"),
    latitude: Optional[float] = Query(None, description="GPS Latitude"),
    longitude: Optional[float] = Query(None, description="GPS Longitude"),
):
    """Fetch live 24-48h weather forecast using exact GPS coordinates or region fallback."""
    return fetch_weather_forecast(location or "Uttar Pradesh", latitude=latitude, longitude=longitude)
