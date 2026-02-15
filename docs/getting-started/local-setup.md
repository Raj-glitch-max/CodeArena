# Local Setup

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Docker | 24+ | `docker --version` |
| Docker Compose | 3.8+ | `docker compose version` |
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Git | 2.40+ | `git --version` |

Minimum resources: 4 CPU cores, 8GB RAM (PostgreSQL + Redis + RabbitMQ + 6 services).

## Quick Start

```bash
git clone https://github.com/Raj-glitch-max/CodeArena.git
cd CodeArena
```

### Option 1: Full stack via Docker Compose

```bash
# Copy environment file
cp .env.example .env  # or use the existing .env

# Build and start everything
docker compose up --build
```

This starts:
- PostgreSQL (`:5432`)
- Redis (`:6379`)
- RabbitMQ (`:5672`, management UI at `:15672`)
- auth-service (`:3001`)
- battle-service (`:3002`)
- execution-service (`:3003`)
- rating-service (`:3004`)
- websocket-server (`:3000`)
- frontend (`:8083`)

### Option 2: Frontend dev server + Dockerized backend

```bash
# Start backend infrastructure and services
docker compose up --build -d

# Install frontend dependencies
npm install

# Start Vite dev server with HMR
npm run dev
# Frontend at http://localhost:5173
```

This is faster for frontend development — Vite HMR gives sub-100ms hot reloads vs rebuilding the Docker image.

## Verify Everything Works

```bash
# Check all containers are running
docker compose ps

# Health checks
curl http://localhost:3001/health  # auth-service
curl http://localhost:3002/health  # battle-service
curl http://localhost:3003/health  # execution-service
curl http://localhost:3004/health  # rating-service

# Expected response:
# {"status":"ok","service":"auth-service"}
```

## Common Issues

### Port conflicts
If port 5432 is already used by a local PostgreSQL:
```bash
# Stop local PostgreSQL
sudo systemctl stop postgresql

# Or change the port mapping in docker-compose.yml
ports:
  - "5433:5432"  # Map to 5433 instead
```

### Services crash on first start
PostgreSQL takes 10-30 seconds to initialize. Docker Compose `depends_on` with `condition: service_healthy` handles this, but if a service starts before PostgreSQL is ready:
```bash
docker compose restart auth-service battle-service rating-service
```

### Frontend can't reach backend
Check `VITE_API_URL` in `.env` matches the auth-service port:
```
VITE_API_URL=http://localhost:3001/api
```

## Kubernetes Setup

See [Kubernetes documentation](../infrastructure/kubernetes.md) for deploying to Minikube or EKS.
