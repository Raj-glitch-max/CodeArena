#!/bin/bash
# =============================================================================
#  Jenkins Troubleshooting Script
#  Diagnoses and fixes common Jenkins + Kubernetes issues
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Jenkins Troubleshooting Tool${NC}"
echo "================================"
echo ""

# ─── Check Jenkins Pod Status ───
echo -e "${BLUE}1. Checking Jenkins Controller Pod...${NC}"
JENKINS_POD=$(kubectl get pods -n jenkins -l app.kubernetes.io/component=jenkins-controller -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$JENKINS_POD" ]; then
    echo -e "${RED}❌ Jenkins controller pod not found!${NC}"
    echo "Run: cd k8s/jenkins && ./setup-jenkins.sh"
    exit 1
fi

POD_STATUS=$(kubectl get pod "$JENKINS_POD" -n jenkins -o jsonpath='{.status.phase}')
echo -e "   Pod: $JENKINS_POD"
echo -e "   Status: $POD_STATUS"

if [ "$POD_STATUS" != "Running" ]; then
    echo -e "${RED}❌ Jenkins is not running!${NC}"
    echo "Checking logs..."
    kubectl logs "$JENKINS_POD" -n jenkins --tail=50
    exit 1
fi
echo -e "${GREEN}✅ Jenkins controller is running${NC}"
echo ""

# ─── Check ServiceAccount ───
echo -e "${BLUE}2. Checking ServiceAccount...${NC}"
if kubectl get serviceaccount jenkins -n jenkins >/dev/null 2>&1; then
    echo -e "${GREEN}✅ ServiceAccount 'jenkins' exists${NC}"
else
    echo -e "${RED}❌ ServiceAccount 'jenkins' not found!${NC}"
    echo "Creating ServiceAccount..."
    kubectl create serviceaccount jenkins -n jenkins
fi
echo ""

# ─── Check RBAC Permissions ───
echo -e "${BLUE}3. Checking RBAC Permissions...${NC}"

# Check if jenkins can create pods in jenkins namespace
if kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Can create pods in jenkins namespace${NC}"
else
    echo -e "${RED}❌ Cannot create pods in jenkins namespace!${NC}"
    echo "Applying RBAC..."
    kubectl apply -f rbac-jenkins-deploy.yaml
fi

# Check if jenkins can deploy to codearena namespace
if kubectl auth can-i create deployments --as=system:serviceaccount:jenkins:jenkins -n codearena >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Can deploy to codearena namespace${NC}"
else
    echo -e "${RED}❌ Cannot deploy to codearena namespace!${NC}"
    echo "Applying RBAC..."
    kubectl apply -f rbac-jenkins-deploy.yaml
fi
echo ""

# ─── Check Kubernetes API Connectivity ───
echo -e "${BLUE}4. Testing Kubernetes API Connectivity...${NC}"
kubectl exec "$JENKINS_POD" -n jenkins -- sh -c "curl -k https://kubernetes.default.svc.cluster.local/api" >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Can reach Kubernetes API from Jenkins pod${NC}"
else
    echo -e "${RED}❌ Cannot reach Kubernetes API!${NC}"
    echo "This might be a network policy issue."
fi
echo ""

# ─── Check Agent Pods ───
echo -e "${BLUE}5. Checking Agent Pods...${NC}"
AGENT_PODS=$(kubectl get pods -n jenkins -l jenkins=agent --no-headers 2>/dev/null | wc -l)
if [ "$AGENT_PODS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $AGENT_PODS agent pod(s):${NC}"
    kubectl get pods -n jenkins -l jenkins=agent
    echo ""
    echo "Recent agent pod events:"
    kubectl get events -n jenkins --sort-by=.lastTimestamp | grep -i "agent\|pod" | tail -10
else
    echo -e "${GREEN}✅ No stuck agent pods${NC}"
fi
echo ""

# ─── Check Jenkins Configuration ───
echo -e "${BLUE}6. Checking Jenkins Kubernetes Cloud Config...${NC}"
kubectl exec "$JENKINS_POD" -n jenkins -- cat /var/jenkins_home/jenkins.yaml 2>/dev/null | grep -A 20 "kubernetes:" || echo "Config not found"
echo ""

# ─── Check Services ───
echo -e "${BLUE}7. Checking Services...${NC}"
kubectl get svc -n jenkins
echo ""

# ─── Cleanup Stuck Pods ───
echo -e "${BLUE}8. Cleanup Options${NC}"
read -p "Do you want to delete stuck agent pods? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting agent pods..."
    kubectl delete pods -n jenkins -l jenkins=agent --force --grace-period=0 2>/dev/null || echo "No agent pods to delete"
    echo -e "${GREEN}✅ Cleanup complete${NC}"
fi
echo ""

# ─── Summary ───
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}Troubleshooting Complete${NC}"
echo "═══════════════════════════════════════════════"
echo ""
echo "Useful commands:"
echo "  - View Jenkins logs: kubectl logs -f $JENKINS_POD -n jenkins"
echo "  - Restart Jenkins: kubectl rollout restart deployment/jenkins -n jenkins"
echo "  - Delete stuck agents: kubectl delete pods -n jenkins -l jenkins=agent --force"
echo "  - Check RBAC: kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins"
echo ""
echo "If issues persist:"
echo "  1. Reinstall Jenkins: helm uninstall jenkins -n jenkins && ./setup-jenkins.sh"
echo "  2. Check Minikube resources: minikube status"
echo "  3. Increase Minikube resources: minikube start --cpus=4 --memory=8192"
echo ""
