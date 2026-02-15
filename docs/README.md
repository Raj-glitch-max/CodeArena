# CodeArena Documentation

## Navigation

### Getting Started
- [Local Setup](getting-started/local-setup.md) — Docker Compose development environment
- [Environment Variables](getting-started/environment-variables.md) — all configuration options
- [Database Setup](getting-started/database-setup.md) — PostgreSQL schema and migrations

### Architecture
- [System Architecture](ARCHITECTURE.md) — design, data flow, scaling
- [Contributing](CONTRIBUTING.md) — how to contribute
- [Changelog](CHANGELOG.md) — version history

### Microservices
- [Auth Service](microservices/auth-service.md) — JWT authentication, user management
- [Battle Service](microservices/battle-service.md) — battle logic, matchmaking
- [Execution Service](microservices/execution-service.md) — sandboxed code execution
- [Rating Service](microservices/rating-service.md) — ELO ratings, leaderboard
- [WebSocket Service](microservices/websocket-service.md) — real-time events

### Infrastructure
- [Kubernetes](infrastructure/kubernetes.md) — deployments, services, scaling
- [Terraform](infrastructure/terraform.md) — AWS infrastructure modules
- [Monitoring](infrastructure/monitoring.md) — Prometheus, Grafana, alerts

### Security
- [RBAC](security/rbac.md) — roles and service accounts
- [Network Policies](security/network-policies.md) — zero-trust networking
- [Secrets Management](security/secrets.md) — handling sensitive config

### Deployment
- [CI/CD Pipeline](deployment/ci-cd.md) — Jenkins & GitHub Actions
- [Docker](deployment/docker.md) — image builds, multi-stage Dockerfiles

### Operations
- [Troubleshooting](operations/troubleshooting.md) — real errors and fixes

### API Reference
- [Auth API](api-reference/auth-api.md)
- [Battle API](api-reference/battle-api.md)
- [WebSocket Events](api-reference/websocket-events.md)

### Learning Resources
Historical DevOps learning guides are preserved in [`learning/`](learning/).
