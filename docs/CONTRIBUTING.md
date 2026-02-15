# Contributing to CodeArena

## Prerequisites
- Node.js 20+ and npm
- Docker 24+ and Docker Compose
- Git

## Local Development

```bash
git clone https://github.com/Raj-glitch-max/CodeArena.git
cd CodeArena

# Install frontend dependencies
npm install

# Start infrastructure + backend
docker compose up --build

# Run frontend dev server (separate terminal)
npm run dev
```

## Code Style

### Frontend (React/TypeScript)
- ESLint + TypeScript strict mode
- Functional components with hooks only (no class components)
- Component files: PascalCase (`BattleArena.tsx`)
- Utility files: camelCase (`useAuth.ts`)
- CSS: TailwindCSS utilities, avoid inline styles

### Backend (Node.js/TypeScript)
- Each service follows the same structure: `src/index.ts`, `src/routes/`, `src/utils/`
- Express middleware pattern
- All env vars read from `process.env`, never hardcoded
- Health check at `GET /health` on every service
- Prometheus metrics at `GET /metrics`

## Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/add-group-battles
   ```

2. Make changes, write tests

3. Commit with conventional commits:
   ```
   feat: add group battle support
   fix: resolve WebSocket reconnection race condition
   docs: update API reference for battle endpoints
   ```

4. Push and create a PR against `main`

5. PR requirements:
   - All CI checks pass
   - At least 1 reviewer approval
   - No merge conflicts

## Adding a New Microservice

1. Create directory under `backend/services/your-service/`
2. Copy the structure from `auth-service` as a template
3. Add `DockerFile`, `package.json`, `tsconfig.json`
4. Add service to `docker-compose.yml`
5. Create K8s manifests in `k8s/base/your-service.yaml`
6. Add NetworkPolicy rules in `k8s/base/network-policies.yaml`
7. Add HPA in `k8s/base/hpa.yaml`
8. Update documentation

## Testing

```bash
# Frontend unit tests
npm run test

# Run with watch mode
npm run test:watch
```

## Documentation

Every new feature or service must include:
- Updated README if it changes the architecture
- Service-specific doc in `docs/microservices/`
- API endpoint documentation in `docs/api-reference/`
- Environment variables documented in `docs/getting-started/environment-variables.md`

## Contact

Maintainer: Raj Patil ([@Raj-glitch-max](https://github.com/Raj-glitch-max))
