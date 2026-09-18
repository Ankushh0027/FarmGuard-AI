"""Production configuration for FarmGuard AI backend.

Handles environment-driven settings, environment separation (development, test, production),
CORS validation, authentication secrets, rate limiting constants, and production invariants.
"""

import os
import json
import logging
from typing import List, Optional
from enum import Enum


class Environment(str, Enum):
    DEVELOPMENT = "development"
    TEST = "test"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings:
    """Application configuration settings loaded from environment variables."""

    def __init__(self):
        # Environment & Execution Mode
        self.APP_ENV: str = os.getenv("APP_ENV", Environment.DEVELOPMENT.value).lower()
        self.DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes", "t")
        self.HOST: str = os.getenv("HOST", "0.0.0.0")
        self.PORT: int = int(os.getenv("PORT", "8000"))

        # CORS Settings
        raw_origins = os.getenv("ALLOWED_ORIGINS", "")
        if raw_origins.strip():
            if raw_origins.strip().startswith("["):
                try:
                    self.ALLOWED_ORIGINS: List[str] = json.loads(raw_origins)
                except Exception:
                    self.ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]
            else:
                self.ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]
        else:
            if self.APP_ENV == Environment.PRODUCTION.value:
                self.ALLOWED_ORIGINS = ["https://farmguard.ai"]
            else:
                self.ALLOWED_ORIGINS = ["*"]

        # API Security & Authentication
        self.API_AUTH_ENABLED: bool = os.getenv("API_AUTH_ENABLED", "false").lower() in ("true", "1", "yes", "t")
        raw_keys = os.getenv("API_KEYS", "")
        if raw_keys.strip():
            self.API_KEYS: List[str] = [k.strip() for k in raw_keys.split(",") if k.strip()]
        else:
            self.API_KEYS = []

        # Rate Limiting & Payload Bounds
        self.RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
        self.MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_CONTENT_LENGTH", str(1024 * 1024)))  # 1 MB default

        # Observability & Logging
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()

        # External APIs
        self.GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
        self.WEATHER_API_KEY: Optional[str] = os.getenv("WEATHER_API_KEY")
        self.OPENMETEO_BASE_URL: str = os.getenv("OPENMETEO_BASE_URL", "https://api.open-meteo.com/v1/forecast")

        # Run validation
        self.validate()

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == Environment.PRODUCTION.value

    @property
    def is_test(self) -> bool:
        return self.APP_ENV == Environment.TEST.value

    def validate(self) -> None:
        """Validate production constraints and invariants."""
        if self.is_production:
            if self.DEBUG:
                raise ValueError("CRITICAL CONFIGURATION ERROR: DEBUG mode cannot be enabled in production environment.")
            if "*" in self.ALLOWED_ORIGINS and not os.getenv("ALLOW_WILDCARD_CORS_IN_PROD"):
                logging.getLogger("farmguard.config").warning(
                    "Wildcard CORS allowed in production. Ensure this is intentional."
                )
            if self.API_AUTH_ENABLED and not self.API_KEYS:
                raise ValueError("CRITICAL CONFIGURATION ERROR: API_AUTH_ENABLED is true but API_KEYS list is empty.")


_settings_instance: Optional[Settings] = None


def get_settings(force_reload: bool = False) -> Settings:
    """Retrieve singleton Settings instance."""
    global _settings_instance
    if _settings_instance is None or force_reload:
        _settings_instance = Settings()
    return _settings_instance
