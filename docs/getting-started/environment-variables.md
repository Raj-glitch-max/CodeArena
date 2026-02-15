# Environment Variables

## Frontend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | Auth service API base URL |
| `VITE_WEBSOCKET_URL` | `http://localhost:3000` | WebSocket server URL |

## Backend (Docker Compose)

### Shared

| Variable | Default | Used By |
|----------|---------|---------|
| `POSTGRES_USER` | `postgres` | PostgreSQL, all DB services |
| `POSTGRES_PASSWORD` | `postgres123` | PostgreSQL, all DB services |
| `POSTGRES_DB` | `codearena` | PostgreSQL |
| `JWT_SECRET` | `dev-super-secret-key` | auth-service, websocket-server |
| `NODE_ENV` | `production` | All services |

### auth-service (:3001)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | HTTP server port |
| `DATABASE_URL` | `postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/codearena` | PostgreSQL connection string |
| `REDIS_URL` | `redis` | Redis hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | `your-super-secret-jwt-key` | JWT signing key |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `CORS_ORIGIN` | `http://localhost:8083` | Allowed CORS origin |

### battle-service (:3002)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3002` | HTTP server port |
| `DATABASE_URL` | Same as auth | PostgreSQL connection string |
| `REDIS_HOST` | `redis` | Redis hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672` | RabbitMQ connection |
| `CORS_ORIGIN` | `http://localhost:8083` | Allowed CORS origin |

### execution-service (:3003)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3003` | HTTP server port |
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672` | RabbitMQ connection |
| `MAX_EXECUTION_TIME` | `10` | Code execution timeout (seconds) |
| `MAX_MEMORY` | `256M` | Memory limit for sandboxed execution |

### rating-service (:3004)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3004` | HTTP server port |
| `DATABASE_URL` | Same as auth | PostgreSQL connection string |
| `REDIS_URL` | `redis://redis:6379` | Redis connection URL |
| `CORS_ORIGIN` | `http://localhost:8083` | Allowed CORS origin |

### websocket-server (:3000)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | WebSocket server port |
| `REDIS_URL` | `redis://redis:6379` | Redis for pub/sub |
| `JWT_SECRET` | `your-super-secret-jwt-key` | JWT validation key |
| `CORS_ORIGIN` | `http://localhost:8083` | Allowed CORS origin |

## Kubernetes (ConfigMaps)

In Kubernetes, env vars are set via ConfigMaps and Secrets in each service's YAML manifest. See `k8s/base/<service>.yaml` for the exact values.

> **Warning**: The Kubernetes manifests contain hardcoded secrets (e.g., `postgres123`, JWT keys). In production, replace these with Sealed Secrets or External Secrets Operator.

## Production Overrides (.env.production)

For AWS deployment, values like `DATABASE_URL` point to RDS endpoints and `REDIS_URL` points to ElastiCache endpoints. See `.env.production` for the production configuration.
