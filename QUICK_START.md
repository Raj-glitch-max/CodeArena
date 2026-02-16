# 🚀 Quick Start - Fix Jenkins Now

## The Problem
Your Jenkins pipeline fails with:
```
ERROR: Failed to launch agent pod
java.net.SocketTimeoutException: Connect timed out
```

## The Solution (One Command)

```bash
./fix-jenkins-complete.sh
```

This interactive script will:
1. Check your setup
2. Let you choose: Quick fix, Fresh install, or Verify only
3. Apply all necessary fixes
4. Verify everything works

## Manual Steps (If You Prefer)

### Option 1: Quick Fix
```bash
cd k8s/jenkins
./fix-jenkins-now.sh
```

### Option 2: Fresh Install (Recommended)
```bash
cd k8s/jenkins
helm uninstall jenkins -n jenkins 2>/dev/null || true
kubectl delete namespace jenkins 2>/dev/null || true
./setup-jenkins.sh
```

### Option 3: Just Verify
```bash
cd k8s/jenkins
./verify-setup.sh
```

## Access Jenkins

```bash
# Get URL
echo "http://$(minikube ip):32000"

# Credentials
Username: admin
Password: admin123
```

## Create Pipeline Job

1. Open Jenkins
2. New Item → Pipeline
3. Configure:
   - SCM: Git
   - Repository: `https://github.com/Raj-glitch-max/CodeArena.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
4. Save
5. Build Now

## Monitor Build

```bash
# Watch pods
kubectl get pods -n jenkins -w

# View Jenkins logs
kubectl logs -f -l app.kubernetes.io/component=jenkins-controller -n jenkins

# Check agent pods
kubectl get pods -n jenkins -l jenkins=agent
```

## Troubleshooting

```bash
cd k8s/jenkins
./troubleshoot-jenkins.sh
```

## What Was Fixed?

1. ✅ Kubernetes API connection (fixed URL)
2. ✅ Increased timeouts (300s connect, 600s read)
3. ✅ Docker-in-Docker configuration
4. ✅ RBAC permissions
5. ✅ ServiceAccount setup
6. ✅ Jenkinsfile configuration

## Need Help?

- Full documentation: `k8s/jenkins/README.md`
- Detailed fix info: `JENKINS_FIX_SUMMARY.md`
- Troubleshoot: `cd k8s/jenkins && ./troubleshoot-jenkins.sh`

## Common Issues

### "Still getting timeout errors"
```bash
# Increase Minikube resources
minikube stop
minikube start --cpus=4 --memory=8192 --disk-size=40g

# Then reinstall
cd k8s/jenkins && ./setup-jenkins.sh
```

### "Agent pods stuck in Pending"
```bash
# Check resources
kubectl top nodes
kubectl describe pod <pod-name> -n jenkins

# Clean up
kubectl delete pods -n jenkins -l jenkins=agent --force
```

### "RBAC errors"
```bash
# Reapply RBAC
cd k8s/jenkins
kubectl apply -f rbac-jenkins-deploy.yaml

# Verify
kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins
```

## Success Indicators

When everything works, you'll see:
- ✅ Agent pod created in `jenkins` namespace
- ✅ Pod reaches `Running` state
- ✅ Pipeline stages execute
- ✅ Services deploy to `codearena` namespace

That's it! Your Jenkins should now work perfectly. 🎉
