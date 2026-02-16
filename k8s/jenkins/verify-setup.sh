#!/bin/bash
# =============================================================================
#  Verify Jenkins Setup Before Running Pipeline
# =============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

echo "🔍 Verifying Jenkins Setup"
echo "=========================="
echo ""

# Check 1: Minikube running
echo -n "1. Minikube running... "
if minikube status 2>/dev/null | grep -q "Running"; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: minikube start --cpus=4 --memory=8192"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Jenkins namespace exists
echo -n "2. Jenkins namespace... "
if kubectl get namespace jenkins >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: kubectl create namespace jenkins"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: CodeArena namespace exists
echo -n "3. CodeArena namespace... "
if kubectl get namespace codearena >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: kubectl create namespace codearena"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Jenkins ServiceAccount
echo -n "4. Jenkins ServiceAccount... "
if kubectl get serviceaccount jenkins -n jenkins >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: kubectl create serviceaccount jenkins -n jenkins"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: RBAC ClusterRole
echo -n "5. RBAC ClusterRole... "
if kubectl get clusterrole jenkins-admin >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: kubectl apply -f rbac-jenkins-deploy.yaml"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: RBAC ClusterRoleBinding
echo -n "6. RBAC ClusterRoleBinding... "
if kubectl get clusterrolebinding jenkins-admin-binding >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: kubectl apply -f rbac-jenkins-deploy.yaml"
    ERRORS=$((ERRORS + 1))
fi

# Check 7: Jenkins pod running
echo -n "7. Jenkins pod running... "
JENKINS_POD=$(kubectl get pods -n jenkins -l app.kubernetes.io/component=jenkins-controller -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$JENKINS_POD" ]; then
    POD_STATUS=$(kubectl get pod "$JENKINS_POD" -n jenkins -o jsonpath='{.status.phase}')
    if [ "$POD_STATUS" = "Running" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Status: $POD_STATUS${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌${NC}"
    echo "   Run: ./setup-jenkins.sh"
    ERRORS=$((ERRORS + 1))
fi

# Check 8: Jenkins service
echo -n "8. Jenkins service... "
if kubectl get service jenkins -n jenkins >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 9: Can create pods in jenkins namespace
echo -n "9. RBAC: Create pods in jenkins... "
if kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: kubectl apply -f rbac-jenkins-deploy.yaml"
    ERRORS=$((ERRORS + 1))
fi

# Check 10: Can deploy to codearena namespace
echo -n "10. RBAC: Deploy to codearena... "
if kubectl auth can-i create deployments --as=system:serviceaccount:jenkins:jenkins -n codearena >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "   Run: kubectl apply -f rbac-jenkins-deploy.yaml"
    ERRORS=$((ERRORS + 1))
fi

# Check 11: Kubernetes API connectivity from Jenkins
if [ -n "$JENKINS_POD" ] && [ "$POD_STATUS" = "Running" ]; then
    echo -n "11. K8s API connectivity... "
    if kubectl exec "$JENKINS_POD" -n jenkins -- sh -c "curl -k -s https://kubernetes.default.svc.cluster.local/api" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot verify${NC}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Jenkins is ready.${NC}"
    echo ""
    echo "Access Jenkins:"
    echo "  URL: http://$(minikube ip):32000"
    echo "  Username: admin"
    echo "  Password: admin123"
    echo ""
    echo "You can now run your pipeline!"
else
    echo -e "${RED}❌ Found $ERRORS issue(s). Fix them before running pipeline.${NC}"
    echo ""
    echo "Quick fix: ./fix-jenkins-now.sh"
    echo "Full setup: ./setup-jenkins.sh"
    exit 1
fi

echo "═══════════════════════════════════════════════"
