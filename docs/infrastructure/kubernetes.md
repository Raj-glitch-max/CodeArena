# Kubernetes

## Local Setup (Minikube)

### Prerequisites
```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster (4 CPUs, 8GB RAM minimum)
minikube start --cpus=4 --memory=8192 --driver=docker

# Enable ingress addon
minikube addons enable ingress
minikube addons enable metrics-server
```

### Deploy CodeArena

```bash
# Create namespace
kubectl create namespace codearena

# Build images inside Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t raj-glitch-max/auth-service:latest backend/services/auth-service
docker build -t raj-glitch-max/battle-service:latest backend/services/battle-service
docker build -t raj-glitch-max/execution-service:latest backend/services/execution-service
docker build -t raj-glitch-max/rating-service:latest backend/services/rating-service
docker build -t raj-glitch-max/websocket-server:latest backend/services/websocket-server

# Or use the build script:
bash k8s/build-and-load.sh

# Apply all manifests
kubectl apply -f k8s/base/postgres.yaml
kubectl apply -f k8s/base/redis.yaml
kubectl apply -f k8s/base/rabbitmq.yaml

# Wait for infra to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n codearena --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n codearena --timeout=60s

# Deploy services
kubectl apply -f k8s/base/auth-service.yaml
kubectl apply -f k8s/base/battle-service.yaml
kubectl apply -f k8s/base/execution-service.yaml
kubectl apply -f k8s/base/rating-service.yaml
kubectl apply -f k8s/base/websocket-service.yaml

# Apply ingress, HPAs, network policies
kubectl apply -f k8s/base/ingress.yaml
kubectl apply -f k8s/base/hpa.yaml
kubectl apply -f k8s/base/network-policies.yaml
kubectl apply -f k8s/base/pdb.yaml
kubectl apply -f k8s/security/rbac.yaml
```

### Verify

```bash
kubectl get pods -n codearena
# Expected: all pods Running with READY 1/1

kubectl get svc -n codearena
# Expected: all services with ClusterIP

kubectl get ingress -n codearena
# Expected: codearena-ingress and websocket-ingress
```

### Access

```bash
# Add hosts entry
echo "$(minikube ip) codearena.local ws.codearena.local" | sudo tee -a /etc/hosts

# Test
curl http://codearena.local/api/auth/health
```

## Manifest Structure

```
k8s/
├── base/                          # Core manifests
│   ├── postgres.yaml              # StatefulSet + PVC (5Gi) + headless Service
│   ├── redis.yaml                 # Deployment + ClusterIP Service
│   ├── rabbitmq.yaml              # Deployment + ClusterIP Service
│   ├── auth-service.yaml          # Deployment (2 replicas) + ConfigMap + Secret + ClusterIP
│   ├── battle-service.yaml        # Deployment (2 replicas) + ConfigMap + Secret + ClusterIP
│   ├── execution-service.yaml     # Deployment (2 replicas) + ConfigMap + ClusterIP
│   ├── rating-service.yaml        # Deployment (2 replicas) + ConfigMap + ClusterIP
│   ├── websocket-service.yaml     # Deployment (2 replicas) + ClusterIP
│   ├── ingress.yaml               # Nginx Ingress (HTTP + WebSocket)
│   ├── hpa.yaml                   # HPAs for all 5 services
│   ├── pdb.yaml                   # PodDisruptionBudgets
│   └── network-policies.yaml      # Zero-trust network policies
├── security/
│   └── rbac.yaml                  # Roles + ServiceAccounts
├── monitoring/
│   ├── prometheus-alerts.yaml     # Alert rules
│   ├── grafana-dashboard.json     # Importable dashboard
│   └── jaeger-instance.yaml       # Jaeger operator instance
└── jenkins/
    ├── values.yaml                # Jenkins Helm chart values
    └── rbac-jenkins-deploy.yaml   # Jenkins deploy permissions
```

## Resource Requirements

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-----------|---------|--------------|------------|
| auth-service | 200m | 500m | 256Mi | 512Mi |
| battle-service | 200m | 500m | 256Mi | 512Mi |
| execution-service | 200m | 500m | 256Mi | 512Mi |
| rating-service | 200m | 500m | 256Mi | 512Mi |
| websocket-service | 200m | 500m | 256Mi | 512Mi |
| PostgreSQL | 500m | 1000m | 512Mi | 1Gi |
| **Total (min)** | **1.7 CPU** | — | **2.3Gi** | — |

## HPA Configuration

| Service | Min | Max | CPU Target | Scale-up Window |
|---------|-----|-----|-----------|-----------------|
| auth-service | 2 | 10 | 70% | 60s |
| battle-service | 3 | 15 | 70% | 30s |
| execution-service | 5 | 30 | 60% | 15s |
| rating-service | 2 | 8 | 70% | 60s |
| websocket-service | 3 | 20 | 60% | 30s |

## Ingress Routing

| Host | Path | Service | Port |
|------|------|---------|------|
| `codearena.local` | `/api/auth` | auth-service | 3001 |
| `codearena.local` | `/api/battle` | battle-service | 3002 |
| `codearena.local` | `/api/execution` | execution-service | 3003 |
| `codearena.local` | `/api/rating` | rating-service | 3004 |
| `ws.codearena.local` | `/` | websocket-service | 3005 |

WebSocket ingress has separate configuration with sticky sessions and 1-hour proxy timeout.
