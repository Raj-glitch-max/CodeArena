# Changelog

All notable changes to CodeArena.

## [1.0.0] - 2026-02-15

### Added
- **Microservices architecture**: auth-service, battle-service, execution-service, rating-service, websocket-service
- **React frontend** with Cyberpunk theme (TailwindCSS)
- **Real-time features**: Socket.IO-based live battle progress, matchmaking
- **Code execution**: Sandboxed execution via RabbitMQ workers (10s timeout, 256MB limit)
- **ELO rating system** with leaderboard
- **Kubernetes deployment**: Full manifests with HPAs, PDBs, NetworkPolicies
- **Terraform modules**: VPC, EKS, RDS Multi-AZ, ElastiCache
- **Monitoring**: Prometheus + Grafana dashboards + AlertManager rules
- **CI/CD**: Jenkins pipeline with Kubernetes agents
- **Security**: RBAC, zero-trust network policies, sealed secrets
- **Docker Compose** for local development

### Technical Decisions
- Switched from MongoDB to PostgreSQL for ACID guarantees on battle results
- Refactored from monolith Docker Compose to microservices
- Chose RabbitMQ over direct HTTP for code execution to decouple and scale workers independently
- Implemented zero-trust networking — default deny-all with explicit allow rules per service

### Known Issues
- Frontend uses `:latest` Docker tag instead of SHA-pinned tags
- WebSocket service port mismatch between docker-compose (3000) and K8s manifest (3005)
- Jenkins pipeline requires manual Groovy init script for Kubernetes cloud config (JCasC plugin not auto-installed by Helm chart)
