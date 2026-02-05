# ============================================
# CodeArena Backend - Production Dockerfile
# Multi-stage build for optimized image size
# ============================================

# Stage 1: Builder - Install dependencies
FROM python:3.11-slim AS builder

WORKDIR /build

# Install system dependencies for compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies to user directory
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================
# Stage 2: Runtime - Debian slim for asyncpg compatibility
FROM python:3.11-slim

# Add labels for metadata
LABEL maintainer="raj@codearena.com"
LABEL version="1.0"
LABEL description="CodeArena Backend API"

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user first
RUN groupadd -g 1000 appuser && \
    useradd -u 1000 -g appuser -m appuser

# Copy Python dependencies from builder to appuser home
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser app ./app

# Switch to non-root user
USER appuser

# Add local bin to PATH (now using appuser home)
ENV PATH=/home/appuser/.local/bin:$PATH

# Expose port
EXPOSE 9000

# Health check (use GET request, not HEAD)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 -O- http://localhost:9000/health || exit 1

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000", "--workers", "2"]
