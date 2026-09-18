# ==============================================================================
# FarmGuard AI - Production Dockerfile
# Multi-stage / lightweight non-root container for FastAPI backend
# ==============================================================================

FROM python:3.12-slim AS base

# Prevent Python from buffering stdout/stderr and creating bytecode
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_ENV=production \
    PORT=8000

WORKDIR /app

# Install security updates and curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root system user and group
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh -d /app appuser

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Set proper ownership for non-root execution
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose FastAPI listening port
EXPOSE 8000

# Healthcheck targeting liveness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Launch production ASGI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
