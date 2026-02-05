# ============================================
# CodeArena Frontend - Production Dockerfile
# Multi-stage: Build React app + Serve with Nginx
# ============================================

# Stage 1: Build React application
FROM node:18-alpine AS builder

WORKDIR /build

# Copy package files for better caching
COPY package*.json ./

# Install ALL dependencies (including dev deps for build)
RUN npm ci

# Copy source code
# Copy source code
COPY . .

# Build args
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ============================================
# Stage 2: Serve with Nginx
FROM nginx:alpine

# Add labels
LABEL maintainer="raj@codearena.com"
LABEL version="1.0"
LABEL description="CodeArena Frontend UI"

# Install wget for health checks
RUN apk add --no-cache wget

# Copy built assets from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check (use GET request, not HEAD)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 -O- http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
