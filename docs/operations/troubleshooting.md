# Troubleshooting

Real errors encountered during development and deployment, with actual fixes.

---

## Docker Compose Issues

### `getaddrinfo EAI_AGAIN redis`
**Cause**: Service started before Redis was ready, even with `depends_on`.
**Fix**: Add health check to Redis in docker-compose.yml:
```yaml
redis:
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 30s
    retries: 5
```
Then use `condition: service_healthy` in dependent services.

### `FATAL: password authentication failed for user "postgres"`
**Cause**: PostgreSQL volume has data from an old instance with a different password.
**Fix**: Delete the volume and recreate:
```bash
docker compose down -v  # -v deletes volumes
docker compose up --build
```

### `port is already allocated`
**Cause**: Local PostgreSQL/Redis running on the same port.
**Fix**: Stop local service or change port mapping in docker-compose.yml.

---

## Kubernetes Issues

### `ImagePullBackOff` after building images
**Cause**: Images built on host Docker daemon, not Minikube's.
**Fix**:
```bash
eval $(minikube docker-env)
docker build -t raj-glitch-max/auth-service:latest backend/services/auth-service
```
Also ensure `imagePullPolicy: IfNotPresent` (not `Always`) in your deployment YAML.

### `CrashLoopBackOff` — auth-service
**Cause**: PostgreSQL not ready when auth-service starts.
**Fix**: Wait for PostgreSQL to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=postgres -n codearena --timeout=120s
```
Then deploy services.

### `DNS resolution failed` (getaddrinfo EAI_AGAIN)
**Cause**: Network policies blocking DNS (port 53).
**Fix**: Added `allow-dns` NetworkPolicy:
```yaml
egress:
  - ports:
      - protocol: UDP
        port: 53
      - protocol: TCP
        port: 53
```

### Services can't reach each other after applying NetworkPolicies
**Cause**: Default deny-all blocks everything. Missing egress rules.
**Fix**: Each service needs explicit egress rules for every dependency it calls. Check `k8s/base/network-policies.yaml` for the complete allow list.

---

## Jenkins Issues

### `tcpSlaveAgentListener is null` — Agents can't connect
**Cause**: Agent listener not enabled in Helm values.
**Fix**: Added `websocket true` to Jenkinsfile Kubernetes agent block, bypassing TCP entirely:
```groovy
kubernetes {
  websocket true
  yaml """..."""
}
```

### `kubernetes.default.svc` DNS resolution fails in Jenkins
**Cause**: Java's DNS resolver inside Jenkins doesn't work with Kubernetes DNS in some Minikube setups.
**Fix**: Use the Cluster IP directly:
```groovy
kubeCloud.setServerUrl("https://10.96.0.1")
```

### Plugins not installed after Helm deploy
**Cause**: `installPlugins: []` in values.yaml (empty array).
**Fix**: List required plugins explicitly:
```yaml
installPlugins:
  - kubernetes:latest
  - workflow-aggregator:latest
  - git:latest
  - pipeline-stage-view:latest
```

---

## Frontend Issues

### Vite HMR not working inside Docker
**Cause**: File watching doesn't work through Docker volumes on some systems.
**Fix**: Run `npm run dev` locally instead of in Docker. Use Docker only for the backend:
```bash
docker compose up --build -d  # Backend in Docker
npm run dev                    # Frontend locally at :5173
```

### API calls return CORS errors
**Cause**: `CORS_ORIGIN` env var doesn't match the frontend URL.
**Fix**: Ensure `CORS_ORIGIN=http://localhost:8083` (Docker) or `http://localhost:5173` (Vite dev server) in the backend service's env vars.
