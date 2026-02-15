# Kubernetes Mastery - Container Orchestration

**Goal:** Scale beyond Docker Compose with Kubernetes

## Part 1: Why Kubernetes?

**Docker Compose limits:**
- Single server only
- Manual scaling
- No self-healing
- No load balancing
- No rolling updates

**Kubernetes:**
- Multi-server cluster
- Auto-scaling
- Self-healing (restarts crashed containers)
- Built-in load balancing
- Zero-downtime deployments

---

## Part 2: Core Concepts

### Pod
Smallest deployable unit. Usually 1 container per pod.

### Deployment
Manages pods. Ensures desired number running.

### Service
Exposes pods to network. Load balances traffic.

### Namespace
Virtual cluster for isolation.

### ConfigMap
Configuration data (non-sensitive).

### Secret
Sensitive data (passwords, keys).

---

## Part 3: Architecture

```
Cluster
├── Master Node (Control Plane)
│   ├── API Server
│   ├── Scheduler
│   └── Controller Manager
└── Worker Nodes
    ├── kubelet (runs containers)
    ├── kube-proxy (networking)
    └── Container Runtime (Docker/containerd)
```

---

## Part 4: Local Setup (minikube)

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster
minikube start

# Verify
kubectl get nodes
```

---

## Part 5: Basic Deployment

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
      - name: auth
        image: yourusername/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

**Apply:**
```bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl logs <pod-name>
```

---

## Part 6: Service

**service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

**Types:**
- `ClusterIP`: Internal only
- `NodePort`: Exposes on node IP
- `LoadBalancer`: Cloud load balancer

---

## Part 7: ConfigMap & Secrets

**ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: production
  LOG_LEVEL: info
```

**Secret:**
```bash
kubectl create secret generic db-secret \
  --from-literal=url='postgresql://user:pass@host/db'
```

**Usage:**
```yaml
env:
- name: NODE_ENV
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: NODE_ENV
```

---

## Part 8: AWS EKS (Production)

**Create cluster:**
```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create cluster
eksctl create cluster \
  --name codearena \
  --region us-east-1 \
  --nodegroup-name standard \
  --node-type t3.medium \
  --nodes 3

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name codearena
```

---

## Part 9: Complete App Deployment

**namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: codearena
```

**postgres.yaml**
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: codearena
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

---

## Part 10: Commands

```bash
# Pods
kubectl get pods
kubectl describe pod <name>
kubectl logs <pod-name>
kubectl exec -it <pod-name> -- bash

# Deployments
kubectl get deployments
kubectl scale deployment <name> --replicas=5
kubectl rollout status deployment/<name>
kubectl rollout undo deployment/<name>

# Services
kubectl get services
kubectl describe service <name>

# Secrets
kubectl get secrets
kubectl create secret generic <name> --from-literal=key=value

# Apply configs
kubectl apply -f deployment.yaml
kubectl delete -f deployment.yaml

# Cluster info
kubectl cluster-info
kubectl get nodes
kubectl get all
```

---

## Part 11: Scaling & Updates

**Horizontal scaling:**
```bash
kubectl scale deployment auth-service --replicas=10
```

**Auto-scaling:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Rolling update:**
```bash
kubectl set image deployment/auth-service auth=yourusername/auth-service:v2
```

---

## Part 12: Production Checklist

- [ ] Multi-node cluster (3+ nodes)
- [ ] Resource limits on pods
- [ ] Liveness/readiness probes
- [ ] Auto-scaling configured
- [ ] Persistent volumes for databases
- [ ] Secrets management
- [ ] Ingress controller (Nginx)
- [ ] Monitoring (Prometheus)
- [ ] Logging (ELK/Loki)
- [ ] Backup strategy

---

**Next:** 06_KUBERNETES_TEST.md then 07_MONITORING_GUIDE.md
