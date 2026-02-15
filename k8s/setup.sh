#!/bin/bash

# CodeArena Kubernetes Setup Script
# This script sets up a complete Kubernetes environment for CodeArena

set -e

echo "🚀 CodeArena Kubernetes Setup"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is not installed${NC}"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}❌ kubectl is not installed${NC}"; exit 1; }
command -v minikube >/dev/null 2>&1 || { echo -e "${RED}❌ Minikube is not installed${NC}"; exit 1; }

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Start Minikube
echo "🎯 Starting Minikube cluster..."
if minikube status | grep -q "Running"; then
    echo -e "${YELLOW}⚠️  Minikube already running${NC}"
else
    minikube start --driver=docker --cpus=4 --memory=8192
    echo -e "${GREEN}✅ Minikube started${NC}"
fi
echo ""

# Enable addons
echo "🔌 Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable metrics-server
echo -e "${GREEN}✅ Addons enabled${NC}"
echo ""

# Create namespace
echo "📦 Creating CodeArena namespace..."
kubectl create namespace codearena --dry-run=client -o yaml | kubectl apply -f -
kubectl config set-context --current --namespace=codearena
echo -e "${GREEN}✅ Namespace created and set as default${NC}"
echo ""

# Deploy databases
echo "💾 Deploying databases..."
kubectl apply -f k8s/base/postgres.yaml
kubectl apply -f k8s/base/redis.yaml
echo -e "${GREEN}✅ Database manifests applied${NC}"
echo ""

# Wait for databases
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod/postgres-0 --timeout=120s || echo -e "${YELLOW}⚠️  PostgreSQL taking longer than expected${NC}"
kubectl wait --for=condition=ready pod -l app=redis --timeout=60s || echo -e "${YELLOW}⚠️  Redis taking longer than expected${NC}"
echo -e "${GREEN}✅ Databases ready${NC}"
echo ""

# Deploy microservices
echo "🎯 Deploying microservices..."
kubectl apply -f k8s/base/auth-service.yaml
kubectl apply -f k8s/base/battle-service.yaml
kubectl apply -f k8s/base/execution-service.yaml
kubectl apply -f k8s/base/rating-service.yaml
kubectl apply -f k8s/base/websocket-service.yaml
echo -e "${GREEN}✅ Microservices deployed${NC}"
echo ""

# Deploy ingress
echo "🌐 Deploying ingress..."
kubectl apply -f k8s/base/ingress.yaml
echo -e "${GREEN}✅ Ingress deployed${NC}"
echo ""

# Add to /etc/hosts
MINIKUBE_IP=$(minikube ip)
if ! grep -q "codearena.local" /etc/hosts; then
    echo "📝 Adding codearena.local to /etc/hosts..."
    echo "$MINIKUBE_IP codearena.local" | sudo tee -a /etc/hosts
    echo -e "${GREEN}✅ Added to /etc/hosts${NC}"
else
    echo -e "${YELLOW}⚠️  codearena.local already in /etc/hosts${NC}"
fi
echo ""

# Display status
echo "📊 Cluster Status:"
echo "=================="
kubectl get nodes
echo ""
kubectl get pods
echo ""
kubectl get svc
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🎯 Next steps:"
echo "  1. Check pod status: kubectl get pods"
echo "  2. View logs: kubectl logs <pod-name>"
echo "  3. Test API: curl http://codearena.local/api/auth/health"
echo "  4. Access dashboard: minikube dashboard"
echo ""
echo "📚 Useful commands:"
echo "  - kubectl get all"
echo "  - kubectl logs -f <pod-name>"
echo "  - kubectl exec -it <pod-name> -- bash"
echo "  - kubectl describe pod <pod-name>"
echo ""
