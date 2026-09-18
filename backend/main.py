"""Main entrypoint for FarmGuard AI FastAPI backend.

Configures production settings, CORS, security middleware, request correlation tracing,
safe error handling, and API routing.
"""

import logging
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse

from app.config import get_settings
from app.api.middleware import ProductionSecurityMiddleware
from app.api.routes import router as api_router
from app.observability.logger import log_security_event

settings = get_settings()

# Configure root logging level
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL, logging.INFO))

app = FastAPI(
    title="FarmGuard AI - Backend",
    description=(
        "India-specific AI-powered sustainable farming assistant (NextStep Hacks 2026 - Earth Forward). "
        "Provides deterministic irrigation optimization, water conservation metrics, "
        "crop residue management, and carbon footprint reduction advisory."
    ),
    version="0.1.0",
    docs_url="/docs" if not settings.is_production or settings.DEBUG else None,
    redoc_url="/redoc" if not settings.is_production or settings.DEBUG else None,
)

# 1. Add Production Security & Tracing Middleware
app.add_middleware(ProductionSecurityMiddleware)

# 2. Add CORS Middleware (configured via environment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# 3. Centralized Exception Handlers (Safe Error Responses)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    request_id = getattr(request.state, "request_id", "unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
            "status_code": exc.status_code,
            "request_id": request_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", "unknown")
    log_security_event(
        event_type="VALIDATION_ERROR",
        guardrail="pydantic_validation",
        result="blocked",
        reason="Malformed request payload or invalid schema",
        request_id=request_id,
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "The request body failed schema validation.",
            "details": jsonable_encoder(exc.errors()),
            "status_code": 422,
            "request_id": request_id,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    log_security_event(
        event_type="INTERNAL_SERVER_ERROR",
        guardrail="server_exception_handler",
        result="failed",
        reason=str(exc),
        request_id=request_id,
    )
    message = str(exc) if settings.DEBUG else "An unexpected error occurred processing your request."
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": message,
            "status_code": 500,
            "request_id": request_id,
        },
    )


# 4. Include API routes
app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
