# Monitoring & Observability - Prometheus + Grafana

**Goal:** Know what's happening before users complain

## Part 1: The Three Pillars

### Metrics
Numbers over time (CPU, memory, requests/sec)

### Logs
Text events (errors, warnings, info)

### Traces
Request path through system (A→B→C→D)

---

## Part 2: Prometheus Setup

```bash
# Docker
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Kubernetes
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
```

**prometheus.yml**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'codearena'
    static_configs:
      - targets:
        - 'localhost:3001'  # auth
        - 'localhost:3002'  # battle
        - 'localhost:3004'  # rating
```

---

## Part 3: Node Exporter (System Metrics)

```bash
docker run -d \
  --name node-exporter \
  -p 9100:9100 \
  prom/node-exporter

# Check metrics
curl http://localhost:9100/metrics
```

Provides: CPU, memory, disk, network

---

## Part 4: Application Metrics

**Express.js example:**
```javascript
const promClient = require('prom-client');
const express = require('express');
const app = express();

// Default metrics (CPU, memory)
promClient.collectDefaultMetrics();

// Custom counter
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Custom histogram
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration',
  labelNames: ['method', 'path']
});

// Middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
    end({ method: req.method, path: req.path });
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## Part 5: Grafana Setup

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana

# Login: admin/admin
# Add Prometheus data source: http://prometheus:9090
```

---

## Part 6: Essential Dashboards

**System Overview:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

**Application:**
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Active connections

**Database:**
- Query rate
- Slow queries
- Connection pool

---

## Part 7: Alerting

**Prometheus alert rules:**
```yaml
groups:
- name: example
  rules:
  - alert: HighCPU
    expr: node_cpu_usage > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "CPU usage above 80%"
  
  - alert: APIDown
    expr: up{job="codearena"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "API is down"
```

**Alertmanager config:**
```yaml
route:
  receiver: 'slack'

receivers:
- name: 'slack'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK'
    channel: '#alerts'
    text: '{{ .GroupLabels.alertname }}: {{ .Annotations.summary }}'
```

---

## Part 8: Logging (ELK Stack)

**Filebeat** → **Elasticsearch** → **Kibana**

**docker-compose.yml**
```yaml
elasticsearch:
  image: elasticsearch:8.0.0
  ports:
    - 9200:9200

kibana:
  image: kibana:8.0.0
  ports:
    - 5601:5601

filebeat:
  image: elastic/filebeat:8.0.0
  volumes:
    - /var/log:/var/log:ro
```

---

## Part 9: Distributed Tracing (Jaeger)

```bash
docker run -d \
  --name jaeger \
  -p 16686:16686 \
  -p 6831:6831/udp \
  jaegertracing/all-in-one
```

**Express.js tracing:**
```javascript
const { initTracer } = require('jaeger-client');

const tracer = initTracer({
  serviceName: 'auth-service',
  sampler: { type: 'const', param: 1 }
});

// Trace request
const span = tracer.startSpan('handleLogin');
// ... do work
span.finish();
```

---

## Part 10: PromQL Queries

```promql
# CPU usage
rate(node_cpu_seconds_total[5m])

# Request rate
rate(http_requests_total[1m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# 95th percentile latency
histogram_quantile(0.95, http_request_duration_seconds_bucket)

# Memory used
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
```

---

## Part 11: Production Monitoring Stack

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - 9090:9090
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - 3000:3000
    depends_on:
      - prometheus
  
  node-exporter:
    image: prom/node-exporter
    ports:
      - 9100:9100
  
  alertmanager:
    image: prom/alertmanager
    ports:
      - 9093:9093
```

---

## Part 12: Key Metrics to Monitor

**Golden Signals (Google SRE):**
1. **Latency** - Response time
2. **Traffic** - Requests per second
3. **Errors** - Error rate
4. **Saturation** - Resource usage (CPU, memory)

**RED Method (microservices):**
1. **Rate** - Requests per second
2. **Errors** - Errors per second
3. **Duration** - Response time

---

**Next:** 07_MONITORING_TEST.md then 08_SECURITY_GUIDE.md
