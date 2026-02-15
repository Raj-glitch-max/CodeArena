# Docker

## Images

| Image | Dockerfile | Base Image | Port |
|-------|-----------|-----------|------|
| auth-service | `backend/services/auth-service/DockerFile` | node:20-alpine | 3001 |
| battle-service | `backend/services/battle-service/DockerFile` | node:20-alpine | 3002 |
| execution-service | `backend/services/execution-service/DockerFile` | node:20-alpine | 3003 |
| rating-service | `backend/services/rating-service/DockerFile` | node:20-alpine | 3004 |
| websocket-server | `backend/services/websocket-server/DockerFile` | node:20-alpine | 3000 |
| frontend | `Dockerfile.frontend` | nginx:alpine | 80 |

## Building for Development

```bash
# Build all services
docker compose build

# Build a single service
docker compose build auth-service

# Build with no cache (after dependency changes)
docker compose build --no-cache auth-service
```

## Building for Kubernetes (Minikube)

```bash
# CRITICAL: Use Minikube's Docker daemon
eval $(minikube docker-env)

# Build images
docker build -t raj-glitch-max/auth-service:latest backend/services/auth-service
docker build -t raj-glitch-max/battle-service:latest backend/services/battle-service
docker build -t raj-glitch-max/execution-service:latest backend/services/execution-service
docker build -t raj-glitch-max/rating-service:latest backend/services/rating-service
docker build -t raj-glitch-max/websocket-server:latest backend/services/websocket-server
docker build -t raj-glitch-max/frontend:latest -f Dockerfile.frontend .

# Or use the helper script:
bash k8s/build-and-load.sh
```

> **Common mistake**: Building on the host Docker daemon and wondering why Minikube can't find the image (`ImagePullBackOff`). Always run `eval $(minikube docker-env)` first.

## Frontend Dockerfile

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

Multi-stage build: Node builds the Vite output, Nginx serves the static files. Final image is ~25MB.

## Image Tagging

| Environment | Tag Strategy | Example |
|-------------|-------------|---------|
| Development | `:latest` | `auth-service:latest` |
| CI/CD | `BUILD_NUMBER` | `auth-service:42` |
| Production | Git SHA | `auth-service:a1b2c3d` |

> **Lesson learned**: We started with `:latest` everywhere. This caused Kubernetes to not pull updated images because `imagePullPolicy: IfNotPresent` thinks `latest` is already present. In production, always use immutable tags (SHA or build number).
