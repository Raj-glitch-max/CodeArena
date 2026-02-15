# Execution Service

## Overview

Sandboxed code execution service. Receives jobs from RabbitMQ, runs user-submitted code in isolated environments with strict time and memory limits, and returns results.

- **Port**: 3003
- **Stack**: Node.js 20 + Express + TypeScript
- **Database**: None (stateless)
- **Queue**: RabbitMQ (consumer)
- **Source**: `backend/services/execution-service/`

## How It Works

```
User submits code → Battle Service → RabbitMQ → Execution Worker → Result → RabbitMQ → Battle Service
```

1. Battle service publishes a job to `execution_queue` in RabbitMQ
2. Execution worker picks up the job
3. Code runs in an isolated environment with:
   - **Time limit**: 10 seconds (`MAX_EXECUTION_TIME`)
   - **Memory limit**: 256MB (`MAX_MEMORY`)
4. Worker returns `pass`, `fail`, or `timeout` result via RabbitMQ
5. Docker socket is mounted read-only for container-in-container execution

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/execute` | Yes | Submit code for execution |
| `GET` | `/health` | No | Health check |
| `GET` | `/metrics` | No | Prometheus metrics |

### POST /api/execute
```json
// Request
{
  "code": "function solution(n) { return n * 2; }",
  "language": "javascript",
  "testCases": [
    { "input": "5", "expectedOutput": "10" },
    { "input": "0", "expectedOutput": "0" }
  ]
}

// Response (200)
{
  "status": "completed",
  "results": [
    { "passed": true, "output": "10", "executionTime": 45 },
    { "passed": true, "output": "0", "executionTime": 12 }
  ],
  "totalTime": 57
}
```

## Security Considerations

This service mounts `/var/run/docker.sock` to spawn sandboxed containers. In production:
- Use gVisor or Kata Containers instead of Docker-in-Docker
- Apply seccomp profiles to restrict syscalls
- Run execution pods on dedicated node pools with spot instances
- Network policies restrict this service from reaching PostgreSQL directly

## Kubernetes Deployment

- **Replicas**: 5 (min) → 30 (max via HPA at 60% CPU)
- **Scale-up**: Most aggressive — 100% capacity increase every 15s
- **Scale-down**: Conservative — 2 pods removed per 60s, 5-minute stabilization
- **Reason**: Code execution is CPU-bound. During peak (100+ concurrent battles), each generates 5-10 submissions. Without aggressive scaling, the RabbitMQ queue backs up.
- **Manifest**: `k8s/base/execution-service.yaml`

## Docker Socket Mount

```yaml
# From docker-compose.yml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

The `:ro` flag makes the mount read-only, but the socket itself still allows container creation. This is a known security trade-off — production environments should use a dedicated execution sandbox.
