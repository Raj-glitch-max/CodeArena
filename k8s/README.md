# 🚢 CodeArena Kubernetes Deployment

Complete Kubernetes manifests for deploying the CodeArena microservices platform.

## 📁 Structure

```
k8s/
├── setup.sh                    # One-click deployment script
├── teardown.sh                 # Clean removal script
├── base/                       # Raw Kubernetes manifests
│   ├── nginx-demo.yaml         # Phase 3: Learning exercise
│   ├── postgres.yaml           # StatefulSet + PVC + Service
│   ├── redis.yaml              # Deployment + Service
│   ├── auth-service.yaml       # Deployment + ConfigMap + Secret + Service
│   ├── battle-service.yaml     # Deployment + ConfigMap + Service
│   ├── execution-service.yaml  # Deployment + ConfigMap + Service (sandboxed)
│   ├── rating-service.yaml     # Deployment + ConfigMap + Service
│   ├── websocket-service.yaml  # Deployment + ConfigMap + Service (sticky)
│   ├── ingress.yaml            # API routing + WebSocket routing
│   ├── hpa.yaml                # Autoscaling for all services
│   ├── network-policies.yaml   # Zero-trust networking
│   └── pdb.yaml                # Pod disruption budgets
├── helm/                       # Helm chart (parameterized)
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── _helpers.tpl
│       ├── postgres.yaml
│       ├── redis.yaml
│       ├── microservices.yaml
│       ├── ingress.yaml
│       └── hpa.yaml
└── overlays/                   # Environment-specific overrides
    ├── dev/
    └── prod/
```

## 🚀 Quick Start

### Prerequisites
- Docker
- kubectl
- Minikube
- Helm (optional)

### Method 1: Raw Manifests

```bash
# Start Minikube
minikube start --driver=docker --cpus=4 --memory=8192

# One-click deploy
chmod +x k8s/setup.sh
./k8s/setup.sh

# Check status
kubectl get all -n codearena
```

### Method 2: Helm Chart

```bash
# Install
helm install codearena k8s/helm -n codearena --create-namespace

# Upgrade
helm upgrade codearena k8s/helm -n codearena

# Uninstall
helm uninstall codearena -n codearena
```

## 🏗️ Architecture

```
                    ┌──────────────────────────────────────┐
                    │          Ingress Controller           │
                    │     (codearena.local / ws.codearena)  │
                    └──────────┬───────────────┬───────────┘
                               │               │
              ┌────────────────┼───────────────┼──────────────┐
              │                │               │              │
         /api/auth        /api/battle    /api/rating         /ws
              │                │               │              │
        ┌─────▼────┐    ┌─────▼────┐    ┌─────▼────┐  ┌─────▼────┐
        │   Auth   │    │  Battle  │    │  Rating  │  │WebSocket │
        │ Service  │    │ Service  │    │ Service  │  │ Service  │
        │ (2 pods) │    │ (3 pods) │    │ (2 pods) │  │ (3 pods) │
        └────┬─────┘    └────┬─────┘    └────┬─────┘  └────┬─────┘
             │               │               │              │
             │          ┌────▼─────┐         │              │
             │          │Execution │         │              │
             │          │ Service  │         │              │
             │          │ (5 pods) │         │              │
             │          └──────────┘         │              │
             │               │               │              │
        ┌────▼───────────────▼───────────────▼──────────────▼────┐
        │                      Redis                             │
        │              (Session/Cache/Pub-Sub)                   │
        └────────────────────────────────────────────────────────┘
             │               │               │
        ┌────▼───────────────▼───────────────▼────┐
        │              PostgreSQL                  │
        │         (StatefulSet + PVC)              │
        └─────────────────────────────────────────┘
```

## 📊 Service Details

| Service | Replicas | Port | HPA Range | CPU Target |
|---------|----------|------|-----------|------------|
| Auth | 2 | 3001 | 2-10 | 70% |
| Battle | 3 | 3002 | 3-15 | 70% |
| Execution | 5 | 3003 | 5-30 | 60% |
| Rating | 2 | 3004 | 2-8 | 70% |
| WebSocket | 3 | 3005 | 3-20 | 60% |
| PostgreSQL | 1 | 5432 | N/A | N/A |
| Redis | 1 | 6379 | N/A | N/A |

## 🔐 Security Features

- **Network Policies**: Zero-trust, explicit allow rules per service
- **Pod Security**: Non-root execution, no privilege escalation
- **Secrets**: Base64 encoded, injected via env vars
- **Resource Limits**: CPU/memory limits on all containers
- **Health Probes**: Liveness + readiness on every service

## 🧹 Cleanup

```bash
# Remove all resources
chmod +x k8s/teardown.sh
./k8s/teardown.sh

# Or with Helm
helm uninstall codearena -n codearena

# Stop Minikube
minikube stop

# Delete cluster entirely
minikube delete
```
