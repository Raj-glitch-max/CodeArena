#!/bin/bash
# =============================================================================
#  Quick Fix for Jenkins Kubernetes Connection Issues
# =============================================================================

set -e

echo "🔧 Quick Fix: Jenkins Kubernetes Connection"
echo "==========================================="
echo ""

# Delete stuck agent pods
echo "1. Cleaning up stuck agent pods..."
kubectl delete pods -n jenkins -l jenkins=agent --force --grace-period=0 2>/dev/null || echo "   No stuck pods found"
echo "   ✅ Done"
echo ""

# Ensure ServiceAccount exists
echo "2. Ensuring ServiceAccount exists..."
kubectl create serviceaccount jenkins -n jenkins --dry-run=client -o yaml | kubectl apply -f -
echo "   ✅ Done"
echo ""

# Reapply RBAC
echo "3. Reapplying RBAC permissions..."
kubectl apply -f rbac-jenkins-deploy.yaml
echo "   ✅ Done"
echo ""

# Verify RBAC
echo "4. Verifying RBAC..."
if kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins; then
    echo "   ✅ Jenkins can create pods"
else
    echo "   ❌ RBAC verification failed!"
    exit 1
fi
echo ""

# Restart Jenkins
echo "5. Restarting Jenkins controller..."
JENKINS_POD=$(kubectl get pods -n jenkins -l app.kubernetes.io/component=jenkins-controller -o jsonpath='{.items[0].metadata.name}')
kubectl delete pod "$JENKINS_POD" -n jenkins
echo "   ✅ Pod deleted, waiting for restart..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=jenkins-controller -n jenkins --timeout=300s
echo "   ✅ Jenkins restarted"
echo ""

# Test connectivity
echo "6. Testing Kubernetes API connectivity..."
JENKINS_POD=$(kubectl get pods -n jenkins -l app.kubernetes.io/component=jenkins-controller -o jsonpath='{.items[0].metadata.name}')
if kubectl exec "$JENKINS_POD" -n jenkins -- sh -c "curl -k -s https://kubernetes.default.svc.cluster.local/api" >/dev/null 2>&1; then
    echo "   ✅ Connectivity OK"
else
    echo "   ⚠️  Connectivity test failed (might be normal)"
fi
echo ""

echo "═══════════════════════════════════════════════"
echo "✅ Quick Fix Complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Go to Jenkins: http://$(minikube ip):32000"
echo "  2. Trigger your pipeline build"
echo "  3. Monitor: kubectl get pods -n jenkins -w"
echo ""
echo "If the issue persists, run: ./troubleshoot-jenkins.sh"
echo ""
