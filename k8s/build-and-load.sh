#!/bin/bash

# Build Docker images using docker-compose and load them into Minikube
# This script builds all CodeArena services and makes them available to Kubernetes

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🐳 CodeArena - Build & Load to Minikube"
echo "========================================"
echo ""

# Check if Minikube is running
if ! minikube status | grep -q "Running"; then
    echo -e "${RED}❌ Minikube is not running!${NC}"
    echo "Start it with: minikube start"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Building Docker images with docker-compose...${NC}"
echo ""

# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Build all services using docker-compose
docker-compose build --no-cache

echo ""
echo -e "${YELLOW}📦 Step 2: Tagging images for Kubernetes...${NC}"
echo ""

# Tag images with the names expected by Kubernetes manifests
docker tag auth-service:latest raj-glitch-max/auth-service:latest
docker tag battle-service:latest raj-glitch-max/battle-service:latest
docker tag execution-service:latest raj-glitch-max/execution-service:latest
docker tag rating-service:latest raj-glitch-max/rating-service:latest
docker tag websocket-server:latest raj-glitch-max/websocket-service:latest

echo -e "${GREEN}✅ All images built and tagged successfully!${NC}"
echo ""

echo "📋 Images in Minikube:"
docker images | grep -E "(raj-glitch-max|auth-service|battle-service|execution-service|rating-service|websocket-server)" | head -10

echo ""
echo -e "${GREEN}✅ Done! Images are now available in Minikube.${NC}"
echo ""
echo "Next steps:"
echo "  1. Restart pods: kubectl rollout restart deployment -n codearena"
echo "  2. Check pods: kubectl get pods -n codearena -w"
echo ""
