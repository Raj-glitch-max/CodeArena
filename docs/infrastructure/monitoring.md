# Monitoring

## Stack

```
App Metrics (prom-client) → Prometheus → Grafana
Pod/Node Metrics (kube-state-metrics, node-exporter) → Prometheus → Grafana
Alerts → AlertManager → Slack/Email
```

## Prometheus Setup

Installed via Helm (kube-prometheus-stack):

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
kubectl create namespace monitoring

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set prometheus.prometheusSpec.retention=7d \
  --set prometheus.prometheusSpec.resources.requests.memory=2Gi \
  --set prometheus.prometheusSpec.resources.limits.memory=4Gi
```

### Application Metrics

Each service exposes `/metrics` using `prom-client`:

```typescript
// Every service's index.ts
import client from 'prom-client';
const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});
```

Default metrics include:
- `process_cpu_seconds_total` — CPU usage
- `process_resident_memory_bytes` — Memory usage
- `nodejs_heap_size_used_bytes` — V8 heap
- `nodejs_eventloop_lag_seconds` — Event loop lag

### ServiceMonitor

The `k8s/base/servicemonitor.yaml` tells Prometheus to scrape CodeArena services:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: codearena-services
  namespace: monitoring
spec:
  namespaceSelector:
    matchNames: [codearena]
  selector:
    matchLabels: {}
  endpoints:
    - port: http
      path: /metrics
      interval: 15s
```

## Grafana Dashboards

Access Grafana:
```bash
# Port-forward
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80

# Default credentials
# Username: admin
# Password: prom-operator
```

Import the CodeArena dashboard: `k8s/monitoring/grafana-dashboard.json`

Key panels:
- Pod CPU/Memory usage per service
- Request rate by service
- Error rate (5xx responses)
- Pod restart count
- Node resource utilization

## Alert Rules

Defined in `k8s/monitoring/prometheus-alerts.yaml`:

| Alert | Expression | Threshold | Severity |
|-------|-----------|-----------|----------|
| HighCPUUsage | `rate(container_cpu_usage_seconds_total{namespace="codearena"}[5m])` | > 80% for 5m | warning |
| HighMemoryUsage | `container_memory_usage_bytes / container_spec_memory_limit_bytes` | > 90% for 5m | warning |
| PodCrashLooping | `rate(kube_pod_container_status_restarts_total[15m])` | > 0 for 5m | critical |
| ServiceDown | `up{namespace="codearena"}` | == 0 for 2m | critical |

Apply alert rules:
```bash
kubectl apply -f k8s/monitoring/prometheus-alerts.yaml
```

## Useful PromQL Queries

```promql
# Request rate per service
rate(http_requests_total{namespace="codearena"}[5m])

# Memory usage percentage
container_memory_usage_bytes{namespace="codearena"} / container_spec_memory_limit_bytes * 100

# Pod restart count (last hour)
increase(kube_pod_container_status_restarts_total{namespace="codearena"}[1h])

# Top 5 pods by CPU
topk(5, rate(container_cpu_usage_seconds_total{namespace="codearena"}[5m]))
```

## Jaeger (Distributed Tracing)

```bash
kubectl apply -f k8s/monitoring/jaeger-instance.yaml

# Access UI
kubectl port-forward svc/jaeger-query -n monitoring 16686:16686
# Open http://localhost:16686
```

Traces follow a request across services:
```
Frontend → Ingress → auth-service → PostgreSQL
                   → battle-service → execution-service (via RabbitMQ)
                                    → rating-service
```
