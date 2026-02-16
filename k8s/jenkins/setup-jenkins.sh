#!/bin/bash
# =============================================================================
#  CodeArena Jenkins Setup Script
#  Sets up Jenkins on Minikube with all required RBAC and configs
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 CodeArena Jenkins Setup"
echo "=========================="
echo ""

# ─── Prerequisites ───
echo "📋 Checking prerequisites..."
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}❌ kubectl not installed${NC}"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo -e "${RED}❌ helm not installed${NC}"; exit 1; }
command -v minikube >/dev/null 2>&1 || { echo -e "${RED}❌ minikube not installed${NC}"; exit 1; }

if ! minikube status 2>/dev/null | grep -q "Running"; then
    echo -e "${RED}❌ Minikube is not running!${NC}"
    echo "Start it with: minikube start --cpus=4 --memory=8192"
    exit 1
fi
echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# ─── Create Namespaces ───
echo "📦 Creating namespaces..."
kubectl create namespace jenkins --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace codearena --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✅ Namespaces ready${NC}"
echo ""

# ─── Create ServiceAccount ───
echo "👤 Creating Jenkins ServiceAccount..."
kubectl create serviceaccount jenkins -n jenkins --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✅ ServiceAccount created${NC}"
echo ""

# ─── Apply RBAC ───
echo "🔐 Applying RBAC..."
kubectl apply -f "${SCRIPT_DIR}/rbac-jenkins-deploy.yaml"
echo -e "${GREEN}✅ RBAC configured${NC}"
echo ""

# ─── Verify RBAC ───
echo "🔍 Verifying RBAC permissions..."
if kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Jenkins can create pods in jenkins namespace${NC}"
else
    echo -e "${RED}❌ Jenkins cannot create pods - RBAC issue!${NC}"
    exit 1
fi
echo ""

# ─── Install Jenkins via Helm ───
echo "🏗️  Installing Jenkins via Helm..."
helm repo add jenkins https://charts.jenkins.io 2>/dev/null || true
helm repo update

if helm status jenkins -n jenkins >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Jenkins already installed. Upgrading...${NC}"
    helm upgrade jenkins jenkins/jenkins \
      -n jenkins \
      -f "${SCRIPT_DIR}/values.yaml" \
      --set controller.serviceAccount.create=false \
      --set controller.serviceAccount.name=jenkins \
      --wait --timeout 10m
else
    helm install jenkins jenkins/jenkins \
      -n jenkins \
      -f "${SCRIPT_DIR}/values.yaml" \
      --set controller.serviceAccount.create=false \
      --set controller.serviceAccount.name=jenkins \
      --wait --timeout 10m
fi
echo -e "${GREEN}✅ Jenkins installed${NC}"
echo ""

# ─── Wait for Jenkins to be ready ───
echo "⏳ Waiting for Jenkins to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=jenkins-controller -n jenkins --timeout=300s
echo -e "${GREEN}✅ Jenkins is running${NC}"
echo ""

# ─── Print Access Info ───
MINIKUBE_IP=$(minikube ip)
echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}✅ Jenkins Setup Complete!${NC}"
echo "═══════════════════════════════════════════════"
echo ""
echo "  URL:       http://${MINIKUBE_IP}:32000"
echo "  Username:  admin"
echo "  Password:  admin123"
echo ""
echo "  Next steps:"
echo "    1. Open Jenkins at http://${MINIKUBE_IP}:32000"
echo "    2. Create a new Pipeline job"
echo "    3. Set SCM to: https://github.com/Raj-glitch-max/CodeArena.git"
echo "    4. Branch: main"
echo "    5. Script path: Jenkinsfile"
echo "    6. Click 'Build Now'"
echo ""
echo "  Troubleshooting:"
echo "    - Check logs: kubectl logs -f -l app.kubernetes.io/component=jenkins-controller -n jenkins"
echo "    - Check agents: kubectl get pods -n jenkins -l jenkins=agent"
echo "    - Test RBAC: kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins"
echo ""
