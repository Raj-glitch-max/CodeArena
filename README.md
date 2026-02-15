# CodeArena

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![K8s](https://img.shields.io/badge/kubernetes-1.28-326CE5?logo=kubernetes&logoColor=white)
![Node](https://img.shields.io/badge/node-20.10-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-4169E1?logo=postgresql&logoColor=white)

Real-time competitive coding platform. Players match 1v1 or in groups, solve algorithmic challenges under time pressure, and climb an ELO-based leaderboard. Built as a microservices system deployed on Kubernetes.

```
┌─────────────────────────────────────────────────────────────────┐
│                     React 18 + Vite + TailwindCSS               │
│                      (Cyberpunk Theme / SPA)                    │
└──────────────┬─────────────┬──────────────┬─────────────────────┘
               │             │              │
    ┌──────────▼──┐  ┌───────▼────┐  ┌──────▼───────┐
    │ Auth Service │  │Battle Svc  │  │ WebSocket Svc│
    │  :3001      │  │  :3002     │  │   :3005      │
    │  JWT/CRUD   │  │ Matchmaker │  │  Socket.IO   │
    └──────┬──────┘  └───┬───┬───┘  └──────┬───────┘
           │             │   │              │
    ┌──────▼─────────────▼───┘    ┌─────────▼──────┐
    │   PostgreSQL 15             │    Redis 7     │
    │   (StatefulSet + PVC)       │   (Cache/PubSub)│
    └─────────────────────────────┴────────────────┘
               │
    ┌──────────▼──────────┐   ┌────────────────────┐
    │  Execution Service  │   │   Rating Service   │
    │      :3003          │   │      :3004         │
    │  Code Sandbox       │   │   ELO Algorithm    │
    └─────────┬───────────┘   └────────────────────┘
              │
    ┌─────────▼───────────┐
    │     RabbitMQ        │
    │  (Task Queue)       │
    └─────────────────────┘
```

## Quick Start

```bash
# Clone
git clone https://github.com/Raj-glitch-max/CodeArena.git
cd CodeArena

# Start everything (PostgreSQL, Redis, RabbitMQ, 6 services, frontend)
docker compose up --build

# Frontend: http://localhost:8083
# Auth API:  http://localhost:3001/api/auth
# WebSocket: http://localhost:3000
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite + TypeScript | 18.3 / 5.4 / 5.8 |
| Styling | TailwindCSS + Radix UI | 3.4 |
| Backend | Node.js + Express | 20.10 / 4.x |
| Database | PostgreSQL | 15-alpine |
| Cache | Redis | 7-alpine |
| Queue | RabbitMQ | 3-management |
| Real-time | Socket.IO | 4.8 |
| Container | Docker + Docker Compose | 24.0 / 3.8 |
| Orchestration | Kubernetes (Minikube / EKS) | 1.28 |
| IaC | Terraform | 1.6 |
| Monitoring | Prometheus + Grafana | 2.47 / 10.1 |
| CI/CD | Jenkins + GitHub Actions | 2.541 |

## Microservices

| Service | Port | Role |
|---------|------|------|
| auth-service | 3001 | JWT authentication, user CRUD |
| battle-service | 3002 | Battle creation, matchmaking, game state |
| execution-service | 3003 | Sandboxed code execution via RabbitMQ workers |
| rating-service | 3004 | ELO ratings, leaderboard |
| websocket-service | 3005 | Socket.IO real-time events, live progress |

## Documentation

All documentation lives in [`/docs`](docs/README.md):

- [Architecture](docs/ARCHITECTURE.md) — system design, data flow, tech choices
- [Local Setup](docs/getting-started/local-setup.md) — Docker Compose dev environment
- [Environment Variables](docs/getting-started/environment-variables.md)
- [Microservices](docs/microservices/) — per-service API docs
- [Kubernetes](docs/infrastructure/kubernetes.md) — deployment manifests
- [Terraform](docs/infrastructure/terraform.md) — AWS infrastructure
- [Monitoring](docs/infrastructure/monitoring.md) — Prometheus + Grafana
- [Security](docs/security/) — RBAC, network policies, secrets
- [Troubleshooting](docs/operations/troubleshooting.md) — real errors and fixes

## Project Structure

```
codebattle/
├── src/                    # React frontend (Vite + TypeScript)
├── backend/services/       # Node.js microservices
│   ├── auth-service/       # JWT auth, user management
│   ├── battle-service/     # Battle logic, matchmaking
│   ├── execution-service/  # Code execution workers
│   ├── rating-service/     # ELO ratings
│   └── websocket-server/   # Socket.IO real-time
├── k8s/                    # Kubernetes manifests
│   ├── base/               # Deployments, Services, ConfigMaps
│   ├── monitoring/         # Prometheus rules, Grafana dashboards
│   ├── security/           # RBAC, network policies
│   └── jenkins/            # Jenkins Helm values
├── infra/                  # Terraform modules (VPC, EKS, RDS, ElastiCache)
├── docs/                   # Documentation
├── docker-compose.yml      # Local development
├── Jenkinsfile             # CI/CD pipeline
└── Dockerfile.frontend     # Frontend container
```

## License

MIT
