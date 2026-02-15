# CI/CD Pipeline

## Jenkins (Kubernetes-native)

Jenkins runs inside the Kubernetes cluster, deploying build agents as pods.

### Setup

```bash
# Install Jenkins via Helm
helm repo add jenkins https://charts.jenkins-ci.org
kubectl create namespace jenkins

helm install jenkins jenkins/jenkins -n jenkins \
  -f k8s/jenkins/values.yaml
```

### Configuration

`k8s/jenkins/values.yaml` configures:
- Jenkins controller image (`jenkins:lts`)
- Admin credentials (`admin` / `admin123`)
- NodePort service on `:32000`
- Pre-installed plugins: `kubernetes`, `workflow-aggregator`, `git`, `pipeline-stage-view`

### Kubernetes Cloud

The Kubernetes cloud is configured via a Groovy init script (not JCasC — the `configuration-as-code` plugin wasn't included in the Helm chart's plugin installer, so we had to work around it):

```groovy
// /var/jenkins_home/init.groovy.d/kubernetes-cloud.groovy
def kubeCloud = new KubernetesCloud("kubernetes")
kubeCloud.setServerUrl("https://10.96.0.1")  // Cluster IP, not DNS
kubeCloud.setSkipTlsVerify(true)
kubeCloud.setNamespace("jenkins")
kubeCloud.setJenkinsUrl("http://jenkins.jenkins.svc.cluster.local:8080")
kubeCloud.setJenkinsTunnel("jenkins-agent.jenkins.svc.cluster.local:50000")
```

> **Lesson learned**: We tried `https://kubernetes.default.svc` but the OkHttp client inside Jenkins couldn't resolve it (Java DNS issue in Minikube). Switched to the direct IP `10.96.0.1`.

### Pipeline

The `Jenkinsfile` defines a pipeline that:
1. Checks out code from GitHub
2. Builds all 6 Docker images in parallel (using `docker` container)
3. Deploys to cluster via `kubectl rollout restart` (using `kubectl` container)
4. Verifies deployment

```groovy
pipeline {
  agent {
    kubernetes {
      yaml """..."""  // Pod template with docker + kubectl containers
    }
  }
  stages {
    stage('Build Microservices') { parallel { ... } }
    stage('Deploy to Cluster') { ... }
    stage('Verify Deployment') { ... }
  }
}
```

### RBAC for Jenkins

Jenkins needs two RBAC resources (`k8s/jenkins/rbac-jenkins-deploy.yaml`):
- `ClusterRole/jenkins-admin`: Create agent pods in `jenkins` namespace
- `Role/jenkins-deployer` in `codearena`: Restart deployments

## GitHub Actions (Alternative)

For a simpler CI/CD without managing Jenkins:

```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build images
        run: |
          docker build -t auth-service:${{ github.sha }} backend/services/auth-service
          # ... other services
      - name: Push to registry
        run: |
          docker push $REGISTRY/auth-service:${{ github.sha }}
      - name: Deploy to K8s
        run: |
          kubectl set image deployment/auth-service auth-service=$REGISTRY/auth-service:${{ github.sha }} -n codearena
```
