# Jenkins Setup for CodeArena

This directory contains everything needed to set up Jenkins on Kubernetes with proper RBAC and agent configuration.

## 🚀 Quick Start

### Initial Setup
```bash
cd k8s/jenkins
./setup-jenkins.sh
```

This will:
- Create `jenkins` and `codearena` namespaces
- Create Jenkins ServiceAccount
- Apply RBAC permissions
- Install Jenkins via Helm
- Configure Kubernetes cloud integration

### Access Jenkins
```bash
# Get the URL
minikube service jenkins -n jenkins --url

# Or use NodePort
echo "http://$(minikube ip):32000"
```

**Credentials:**
- Username: `admin`
- Password: `admin123`

## 🔧 Troubleshooting

### Issue: "Failed to launch agent pod" or "Connect timed out"

This is the error you're experiencing. Run the quick fix:

```bash
cd k8s/jenkins
./fix-jenkins-now.sh
```

This script will:
1. Clean up stuck agent pods
2. Verify ServiceAccount exists
3. Reapply RBAC permissions
4. Restart Jenkins controller
5. Test Kubernetes API connectivity

### Comprehensive Troubleshooting

For detailed diagnostics:
```bash
./troubleshoot-jenkins.sh
```

This will check:
- Jenkins pod status
- ServiceAccount configuration
- RBAC permissions
- Kubernetes API connectivity
- Agent pod status
- Jenkins configuration

## 📋 Manual Verification

### Check RBAC Permissions
```bash
# Can Jenkins create pods in jenkins namespace?
kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins

# Can Jenkins deploy to codearena namespace?
kubectl auth can-i create deployments --as=system:serviceaccount:jenkins:jenkins -n codearena
```

### Check Jenkins Logs
```bash
kubectl logs -f -l app.kubernetes.io/component=jenkins-controller -n jenkins
```

### Check Agent Pods
```bash
# List agent pods
kubectl get pods -n jenkins -l jenkins=agent

# Delete stuck agent pods
kubectl delete pods -n jenkins -l jenkins=agent --force --grace-period=0
```

### Test Kubernetes API from Jenkins Pod
```bash
JENKINS_POD=$(kubectl get pods -n jenkins -l app.kubernetes.io/component=jenkins-controller -o jsonpath='{.items[0].metadata.name}')
kubectl exec $JENKINS_POD -n jenkins -- curl -k https://kubernetes.default.svc.cluster.local/api
```

## 🏗️ Architecture

### Components

1. **Jenkins Controller** - Main Jenkins instance running in `jenkins` namespace
2. **Jenkins Agents** - Dynamic pods created in `jenkins` namespace for builds
3. **ServiceAccount** - `jenkins` ServiceAccount with cluster-wide permissions
4. **RBAC** - ClusterRole and RoleBindings for pod creation and deployment

### Key Configuration

**Jenkinsfile Changes:**
- Uses `docker:24-dind` (Docker-in-Docker) instead of mounting host socket
- Explicitly specifies `cloud 'kubernetes'` and `namespace 'jenkins'`
- Increased timeouts for better reliability

**values.yaml Changes:**
- Increased `connectTimeout` to 300s and `readTimeout` to 600s
- Added `waitForPodSec: 600` for pod startup
- Fixed Kubernetes API URL to use full FQDN
- Configured proper Jenkins tunnel for agent communication

**RBAC:**
- ClusterRole for pod/deployment management
- Bindings in both `jenkins` and `codearena` namespaces

## 🔄 Common Operations

### Restart Jenkins
```bash
kubectl rollout restart deployment/jenkins -n jenkins
```

### Reinstall Jenkins
```bash
helm uninstall jenkins -n jenkins
./setup-jenkins.sh
```

### Update Configuration
```bash
# Edit values.yaml, then:
helm upgrade jenkins jenkins/jenkins -n jenkins -f values.yaml
```

### View Jenkins Configuration
```bash
kubectl exec -n jenkins $(kubectl get pods -n jenkins -l app.kubernetes.io/component=jenkins-controller -o jsonpath='{.items[0].metadata.name}') -- cat /var/jenkins_home/jenkins.yaml
```

## 📝 Creating a Pipeline Job

1. Open Jenkins at `http://$(minikube ip):32000`
2. Click "New Item"
3. Enter name: `CodeArena-Pipeline`
4. Select "Pipeline"
5. Under "Pipeline" section:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/Raj-glitch-max/CodeArena.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
6. Click "Save"
7. Click "Build Now"

## 🐛 Known Issues & Solutions

### Issue: Agent pods timeout during creation
**Solution:** Increase Minikube resources
```bash
minikube stop
minikube start --cpus=4 --memory=8192 --disk-size=40g
```

### Issue: Docker builds fail in agent
**Solution:** The Jenkinsfile now uses `docker:24-dind` which runs Docker daemon inside the container. Make sure to start dockerd in build stages.

### Issue: kubectl commands fail in pipeline
**Solution:** Verify the jenkins ServiceAccount has proper RBAC permissions:
```bash
kubectl apply -f rbac-jenkins-deploy.yaml
```

### Issue: "unauthorized" errors
**Solution:** Jenkins needs to authenticate to Kubernetes API. The ServiceAccount token is automatically mounted, but verify:
```bash
kubectl get serviceaccount jenkins -n jenkins
kubectl describe clusterrolebinding jenkins-admin-binding
```

## 📚 Additional Resources

- [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
- [Jenkins Helm Chart](https://github.com/jenkinsci/helm-charts)
- [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)

## 🆘 Still Having Issues?

1. Check Minikube status: `minikube status`
2. Check cluster resources: `kubectl top nodes`
3. Review all logs: `kubectl logs -f -l app.kubernetes.io/component=jenkins-controller -n jenkins`
4. Check events: `kubectl get events -n jenkins --sort-by=.lastTimestamp`
5. Verify network: `kubectl exec -n jenkins <jenkins-pod> -- ping kubernetes.default.svc.cluster.local`

If all else fails, do a clean reinstall:
```bash
helm uninstall jenkins -n jenkins
kubectl delete namespace jenkins
kubectl delete namespace codearena
./setup-jenkins.sh
```
