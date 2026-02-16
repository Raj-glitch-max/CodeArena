#!/bin/bash
# =============================================================================
#  Complete Jenkins Fix - One Command Solution
#  Fixes all Jenkins + Kubernetes connectivity issues
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        Jenkins Complete Fix for CodeArena                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
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

# Ask user what they want to do
echo -e "${YELLOW}Choose an option:${NC}"
echo "  1) Quick fix (keep existing Jenkins, just fix issues)"
echo "  2) Fresh install (recommended - removes and reinstalls)"
echo "  3) Verify only (check if everything is working)"
echo ""
read -p "Enter choice [1-3]: " -n 1 -r
echo ""
echo ""

case $REPLY in
    1)
        echo -e "${BLUE}🔧 Running quick fix...${NC}"
        cd k8s/jenkins
        ./fix-jenkins-now.sh
        ;;
    2)
        echo -e "${BLUE}🏗️  Running fresh install...${NC}"
        
        # Cleanup
        echo "Cleaning up old installation..."
        helm uninstall jenkins -n jenkins 2>/dev/null || echo "  No existing Jenkins found"
        kubectl delete namespace jenkins 2>/dev/null || echo "  No jenkins namespace found"
        kubectl delete namespace codearena 2>/dev/null || echo "  No codearena namespace found"
        kubectl delete clusterrole jenkins-admin 2>/dev/null || echo "  No clusterrole found"
        kubectl delete clusterrolebinding jenkins-admin-binding 2>/dev/null || echo "  No clusterrolebinding found"
        
        echo "Waiting for cleanup to complete..."
        sleep 5
        
        # Fresh install
        cd k8s/jenkins
        ./setup-jenkins.sh
        ;;
    3)
        echo -e "${BLUE}🔍 Running verification...${NC}"
        cd k8s/jenkins
        ./verify-setup.sh
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}🔍 Running verification...${NC}"
cd k8s/jenkins
./verify-setup.sh

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║                  ✅ FIX COMPLETE!                         ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}Your Jenkins is now ready to run pipelines!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo ""
    echo "1. Access Jenkins:"
    echo "   ${BLUE}http://$(minikube ip):32000${NC}"
    echo "   Username: ${YELLOW}admin${NC}"
    echo "   Password: ${YELLOW}admin123${NC}"
    echo ""
    echo "2. Create a Pipeline job:"
    echo "   - Click 'New Item'"
    echo "   - Name: CodeArena-Pipeline"
    echo "   - Type: Pipeline"
    echo "   - SCM: Git"
    echo "   - Repository: https://github.com/Raj-glitch-max/CodeArena.git"
    echo "   - Branch: */main"
    echo "   - Script Path: Jenkinsfile"
    echo ""
    echo "3. Run the pipeline:"
    echo "   - Click 'Build Now'"
    echo "   - Monitor: ${BLUE}kubectl get pods -n jenkins -w${NC}"
    echo ""
    echo "4. If you see issues:"
    echo "   - Troubleshoot: ${BLUE}cd k8s/jenkins && ./troubleshoot-jenkins.sh${NC}"
    echo "   - View logs: ${BLUE}kubectl logs -f -l app.kubernetes.io/component=jenkins-controller -n jenkins${NC}"
    echo ""
    echo "📚 Documentation: ${BLUE}k8s/jenkins/README.md${NC}"
    echo "📊 Fix details: ${BLUE}JENKINS_FIX_SUMMARY.md${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              ⚠️  VERIFICATION FAILED                      ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Run troubleshooting: ${BLUE}cd k8s/jenkins && ./troubleshoot-jenkins.sh${NC}"
    echo ""
fi
