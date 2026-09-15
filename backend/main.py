"""Main entrypoint for FarmGuard AI FastAPI backend."""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="FarmGuard AI - Backend",
    description=(
        "India-specific AI-powered sustainable farming assistant (NextStep Hacks 2026 - Earth Forward). "
        "Provides deterministic irrigation optimization, water conservation metrics, "
        "crop residue management, and carbon footprint reduction advisory."
    ),
    version="0.1.0",
)

# Enable CORS for future React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
