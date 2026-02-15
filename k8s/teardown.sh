#!/bin/bash

# CodeArena Kubernetes Teardown Script
# Removes all CodeArena resources from the cluster

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🗑️  CodeArena Kubernetes Teardown"
echo "=================================="
echo ""
echo -e "${RED}⚠️  This will delete ALL CodeArena resources!${NC}"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔄 Deleting resources..."

# Delete in reverse order of creation
echo "  → Deleting ingress..."
kubectl delete -f k8s/base/ingress.yaml --ignore-not-found 2>/dev/null || true

echo "  → Deleting HPAs..."
kubectl delete -f k8s/base/hpa.yaml --ignore-not-found 2>/dev/null || true

echo "  → Deleting PDBs..."
kubectl delete -f k8s/base/pdb.yaml --ignore-not-found 2>/dev/null || true

echo "  → Deleting network policies..."
kubectl delete -f k8s/base/network-policies.yaml --ignore-not-found 2>/dev/null || true

echo "  → Deleting microservices..."
kubectl delete -f k8s/base/websocket-service.yaml --ignore-not-found 2>/dev/null || true
kubectl delete -f k8s/base/rating-service.yaml --ignore-not-found 2>/dev/null || true
kubectl delete -f k8s/base/execution-service.yaml --ignore-not-found 2>/dev/null || true
kubectl delete -f k8s/base/battle-service.yaml --ignore-not-found 2>/dev/null || true
kubectl delete -f k8s/base/auth-service.yaml --ignore-not-found 2>/dev/null || true

echo "  → Deleting databases..."
kubectl delete -f k8s/base/redis.yaml --ignore-not-found 2>/dev/null || true
kubectl delete -f k8s/base/postgres.yaml --ignore-not-found 2>/dev/null || true

echo "  → Deleting nginx demo..."
kubectl delete -f k8s/base/nginx-demo.yaml --ignore-not-found 2>/dev/null || true

echo ""
echo "🔄 Deleting PVCs..."
kubectl delete pvc --all -n codearena 2>/dev/null || true

echo ""
echo "🔄 Deleting namespace..."
kubectl delete namespace codearena --ignore-not-found 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Teardown complete!${NC}"
echo ""
echo "To also stop Minikube:"
echo "  minikube stop"
echo ""
echo "To completely delete Minikube cluster:"
echo "  minikube delete"
echo ""
