"""FastAPI API routes for FarmGuard AI."""

from fastapi import APIRouter, status, HTTPException
from app.models.farm import FarmInput, FarmAnalysisResponse
from app.calculations.farm_calculator import analyze_farm

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
def health_check():
    """Health check endpoint for service status verification."""
    return {
        "status": "ok",
        "service": "FarmGuard AI Backend",
        "version": "0.1.0",
        "phase": "Phase 1 - Deterministic Calculation Engine"
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
