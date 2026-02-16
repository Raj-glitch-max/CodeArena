# Jenkins Pipeline Fix Summary

## 🐛 Problem
Your Jenkins pipeline was failing with:
```
ERROR: Failed to launch codearena-34-fqxck-17x93-mbzwh
java.net.SocketTimeoutException: Connect timed out
```

This means Jenkins couldn't connect to the Kubernetes API to create agent pods for running your pipeline.

## 🔧 Root Causes Fixed

### 1. Kubernetes API Connection Issues
- **Problem:** Incorrect Kubernetes API URL in Jenkins config
- **Fix:** Changed from `https://kubernetes.default.svc` to `https://kubernetes.default.svc.cluster.local`
- **File:** `k8s/jenkins/values.yaml`

### 2. Insufficient Timeouts
- **Problem:** Default timeouts too short for pod creation
- **Fix:** Increased timeouts:
  - `connectTimeout: 120` → `300` seconds
  - `readTimeout: 300` → `600` seconds
  - Added `waitForPodSec: 600`
- **File:** `k8s/jenkins/values.yaml`

### 3. Docker Build Configuration
- **Problem:** Using `docker:24-cli` which requires host Docker socket (doesn't work in Kubernetes)
- **Fix:** Changed to `docker:24-dind` (Docker-in-Docker) with proper initialization
- **File:** `Jenkinsfile`

### 4. Missing Jenkinsfile Configuration
- **Problem:** Jenkinsfile didn't explicitly specify Kubernetes cloud and namespace
- **Fix:** Added:
  ```groovy
  cloud 'kubernetes'
  namespace 'jenkins'
  defaultContainer 'jnlp'
  ```
- **File:** `Jenkinsfile`

### 5. RBAC Setup Order
- **Problem:** ServiceAccount might be created after RBAC rules
- **Fix:** Setup script now creates ServiceAccount before applying RBAC
- **File:** `k8s/jenkins/setup-jenkins.sh`

## 📁 Files Modified

1. **Jenkinsfile**
   - Added explicit Kubernetes cloud configuration
   - Changed Docker image from `docker:24-cli` to `docker:24-dind`
   - Updated Docker build commands to start dockerd
   - Changed kubectl image to `bitnami/kubectl:latest`

2. **k8s/jenkins/values.yaml**
   - Fixed Kubernetes API URL
   - Increased all timeouts
   - Added `waitForPodSec` configuration
   - Added `retentionTimeout`

3. **k8s/jenkins/setup-jenkins.sh**
   - Rewritten to create ServiceAccount first
   - Added RBAC verification
   - Improved error handling
   - Added troubleshooting commands

## 🆕 New Helper Scripts

### 1. `k8s/jenkins/fix-jenkins-now.sh`
Quick fix for immediate issues:
- Cleans up stuck agent pods
- Verifies ServiceAccount
- Reapplies RBAC
- Restarts Jenkins
- Tests connectivity

**Usage:**
```bash
cd k8s/jenkins
./fix-jenkins-now.sh
```

### 2. `k8s/jenkins/troubleshoot-jenkins.sh`
Comprehensive diagnostics:
- Checks Jenkins pod status
- Verifies ServiceAccount
- Tests RBAC permissions
- Checks Kubernetes API connectivity
- Lists agent pods
- Shows Jenkins configuration

**Usage:**
```bash
cd k8s/jenkins
./troubleshoot-jenkins.sh
```

### 3. `k8s/jenkins/verify-setup.sh`
Pre-flight checks before running pipeline:
- Verifies all prerequisites
- Checks RBAC permissions
- Tests connectivity
- Shows Jenkins access info

**Usage:**
```bash
cd k8s/jenkins
./verify-setup.sh
```

### 4. `k8s/jenkins/README.md`
Complete documentation with:
- Setup instructions
- Troubleshooting guide
- Common operations
- Known issues and solutions

## 🚀 How to Fix Your Jenkins Now

### Option 1: Quick Fix (If Jenkins is already installed)
```bash
cd k8s/jenkins
./fix-jenkins-now.sh
```

### Option 2: Fresh Install (Recommended)
```bash
cd k8s/jenkins

# Remove old installation
helm uninstall jenkins -n jenkins 2>/dev/null || true
kubectl delete namespace jenkins 2>/dev/null || true

# Fresh install with fixes
./setup-jenkins.sh
```

### Option 3: Upgrade Existing Installation
```bash
cd k8s/jenkins
helm upgrade jenkins jenkins/jenkins \
  -n jenkins \
  -f values.yaml \
  --set controller.serviceAccount.create=false \
  --set controller.serviceAccount.name=jenkins
```

## ✅ Verification Steps

After applying the fix:

1. **Verify setup:**
   ```bash
   cd k8s/jenkins
   ./verify-setup.sh
   ```

2. **Access Jenkins:**
   ```bash
   echo "http://$(minikube ip):32000"
   # Username: admin
   # Password: admin123
   ```

3. **Create Pipeline Job:**
   - New Item → Pipeline
   - SCM: Git
   - Repository: `https://github.com/Raj-glitch-max/CodeArena.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

4. **Run Build:**
   - Click "Build Now"
   - Monitor: `kubectl get pods -n jenkins -w`

5. **Check logs if issues:**
   ```bash
   kubectl logs -f -l app.kubernetes.io/component=jenkins-controller -n jenkins
   ```

## 🔍 What to Watch For

When you run the pipeline, you should see:
1. Jenkins creates an agent pod in `jenkins` namespace
2. Pod name will be like `codearena-XX-XXXXX-XXXXX`
3. Pod should reach `Running` state within 1-2 minutes
4. Pipeline stages execute in the agent containers

**Monitor with:**
```bash
kubectl get pods -n jenkins -w
```

## 🆘 If Issues Persist

1. **Check Minikube resources:**
   ```bash
   minikube status
   kubectl top nodes
   ```

2. **Increase resources if needed:**
   ```bash
   minikube stop
   minikube start --cpus=4 --memory=8192 --disk-size=40g
   ```

3. **Run troubleshooting:**
   ```bash
   cd k8s/jenkins
   ./troubleshoot-jenkins.sh
   ```

4. **Check RBAC:**
   ```bash
   kubectl auth can-i create pods --as=system:serviceaccount:jenkins:jenkins -n jenkins
   ```

5. **View detailed logs:**
   ```bash
   kubectl logs -f -l app.kubernetes.io/component=jenkins-controller -n jenkins
   ```

## 📊 Expected Pipeline Flow

```
1. Checkout → Clones your repo
2. Lint & Test → Runs npm lint and tests in node container
3. Build Images → Builds 6 Docker images in parallel using docker:dind
4. Deploy Infrastructure → Deploys PostgreSQL, Redis, RabbitMQ
5. Deploy Services → Deploys microservices to codearena namespace
6. Verify Rollouts → Waits for all deployments to be ready
7. Smoke Test → Checks pod status and health
```

## 🎯 Key Improvements

1. **Reliability:** Increased timeouts prevent premature failures
2. **Docker Builds:** DinD approach works in any Kubernetes cluster
3. **RBAC:** Proper permissions for both agent creation and deployment
4. **Debugging:** Multiple helper scripts for quick diagnosis
5. **Documentation:** Comprehensive README with all scenarios covered

## 📝 Next Steps

1. Apply the fix using one of the options above
2. Run `./verify-setup.sh` to confirm everything is ready
3. Create your pipeline job in Jenkins UI
4. Trigger a build
5. Monitor with `kubectl get pods -n jenkins -w`

Your pipeline should now work! 🎉
