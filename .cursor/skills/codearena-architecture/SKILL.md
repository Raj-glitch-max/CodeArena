---
name: codearena-architecture
description: Guides development of the CodeArena real-time coding battles platform using the established FastAPI/React/Redis/Postgres stack, enforcing architectural constraints, tech stack choices, and design system rules. Use when implementing or modifying backend services, WebSocket flows, matchmaking, execution workers, or frontend features in this repository.
---

## CodeArena Architecture Skill

Use this skill whenever working inside this repo on backend, frontend, or realtime features. Treat `projectIDEA.mdc` as the canonical product spec, and keep all changes consistent with it.

For deeper detail, see:
- `backend_rules.mdc` for backend/service rules
- `frontend_rules.mdc` for frontend/UI rules
- `database_API.mdc` for data modeling and API contracts
- `cursorrules-global.mdc` for shared conventions

### 1. Tech Stack Requirements

When adding or modifying code, stay within this stack unless explicitly extending it:

- **Frontend**: React 18+, TypeScript, Vite, TailwindCSS, Monaco Editor, Socket.IO client, Framer Motion.
- **Backend**: FastAPI, Python 3.11+, async SQLAlchemy 2.x, Pydantic models, JWT Bearer auth.
- **Database**: PostgreSQL 15+ using asyncpg driver via SQLAlchemy.
- **Cache/Queue**: Redis 7+ for hot state, matchmaking queues (sorted sets), pub/sub, and transient battle data.
- **Real-time**: WebSockets (Socket.IO semantics) with an authoritative server tick loop at ~20Hz for battles.
- **Execution**: Sandboxed workers (Docker/Wasm) that consume jobs from a queue; no inline execution in API handlers.

Do NOT introduce alternative core stacks (e.g. different web frameworks, databases, or styling systems) without an explicit migration plan in `projectIDEA.mdc`.

### 2. High-Level Architecture Pattern

- **Monolith-first**: Keep a single FastAPI app and a single React frontend, structured for an easy future split into services or K8s workloads but not prematurely decomposed.
- **Service layer**: Implement domain logic in dedicated service modules (e.g. `BattleManager`, `MatchmakerService`, `ChallengeService`, `UserService`) and keep routers thin.
- **Dependency injection**: Always acquire DB sessions, Redis clients, and auth context via FastAPI dependencies, not via global singletons.
- **Communication style**:
  - Use **REST** endpoints for CRUD-style operations and slow paths (auth, users, challenges, organisms, history, leaderboards snapshots).
  - Use **WebSockets** (Socket.IO-compatible) for real-time battle state, matchmaking status, and lobby/battle tick updates.
- **Workers**: Use separate worker processes for matchmaking loops and code execution, driven by queues in Redis (or another queue backend configured centrally).

When adding new features, first decide whether they belong in REST, WebSocket, or worker layers, and keep responsibilities cleanly separated.

### 3. Hard Constraints (Must Always Hold)

Enforce these rules whenever implementing or refactoring:

- **No inline code execution in API**:
  - API and WebSocket handlers must never directly run user-submitted code.
  - They must enqueue a job (battle evaluation, sample run, GA generation, etc.) into the execution queue and await/report results.
- **No arbitrary user code mutation**:
  - Genetic/evolutionary features must operate on structured representations or predefined strategies, not random string edits of arbitrary source code.
  - All mutation logic should respect constraints from `projectIDEA.mdc` (structured GA only).
- **Auth via JWT Bearer only**:
  - All authenticated endpoints expect `Authorization: Bearer <token>` with the existing JWT scheme.
  - Use shared auth dependencies and security utils; do not add parallel auth systems.
- **State responsibilities**:
  - PostgreSQL: persistent user/accounts/algorithms/challenges/matches, submissions, history, traits, organism lifecycle, and progression.
  - Redis: matchmaking queues, active battle state, transient world ticks, real-time stats, and pub/sub channels for pushing updates.
- **Permadeath enforcement**:
  - The service layer must enforce permadeath: organisms with `is_alive == false` or `death_count >= 3` cannot be queued or matched.
  - All matchmaking, battle creation, evolution, and world-activity code must check these flags before proceeding.

If a change would violate any of these constraints, redesign the approach or stub behavior while keeping the constraints intact.

### 4. Backend Implementation Guidelines

When working in the backend:

- **Routers**:
  - Keep routers thin: validate input, resolve dependencies, call service methods, and shape responses.
  - Do not embed heavy business logic in route functions; that belongs in services.
- **Services**:
  - Encapsulate domain logic in service classes or modules (`BattleManager`, `MatchmakerService`, `ChallengeService`, etc.).
  - Ensure services are written to work with async SQLAlchemy sessions and Redis clients passed in (no globals).
  - Enforce domain invariants (e.g. permadeath, trait unlock rules, matchmaking ranges) here.
- **Database**:
  - Use SQLAlchemy 2.0 async patterns, typed models, and explicit relationships.
  - Respect existing schemas from `database_API.mdc` and existing models; extend instead of rewriting them whenever possible.
- **Redis usage**:
  - Use sorted sets for matchmaking queues (e.g. per mode/difficulty) and time-based queues.
  - Use hashes/keys for per-battle state snapshots and timers.
  - Use pub/sub channels to fan out battle updates to connected WebSocket sessions.
- **Execution workers**:
  - Treat workers as stateless consumers of an execution queue.
  - Jobs must include all data needed (code, problem ID, inputs, timeout, language, etc.) and produce deterministic reports (tests passed, performance metrics, errors).

For complex flows, prefer small, composable functions in services, and add docstrings describing assumptions (e.g. tick rate, ordering guarantees, idempotency).

### 5. Frontend Implementation Guidelines

When working in the frontend:

- **API client**:
  - Use the shared `apiClient` with interceptors for all HTTP requests; do not create ad-hoc `fetch`/`axios` calls.
  - Ensure JWT tokens are attached via interceptors and that auth redirects follow the existing `AuthContext` and route guards.
- **WebSockets**:
  - Use a dedicated Socket.IO client (e.g. custom hook or context) for battle and matchmaking channels.
  - Maintain a clean separation between:
    - connection management (connect/disconnect/reconnect),
    - subscription wiring (join/leave rooms),
    - and UI state (React components consuming battle/matchmaking state).
- **Editor & UX**:
  - Use Monaco as the primary code editor with a custom dark theme matching the design system.
  - “Run” and “Submit” buttons should integrate with the queue-based execution contract (no inline eval in the browser).
  - Respect the real-time updates coming from WebSockets (timers, scores, test results).
- **State management**:
  - Prefer React hooks/context and component-local state; avoid heavyweight global state unless necessary.
  - Derive UI state from server truth (WebSocket + REST) rather than simulating battles fully on the client.

Whenever adding new UI for battles, matchmaking, organisms, or evolution, ensure the flow matches the core game loop described in `projectIDEA.mdc`.

### 6. Design System Rules

Match the established visual style:

- **Base**: OLED black backgrounds (`#000000`, `#02010A`) with subtle gradients.
- **Accents**: Neon cyan (`#00F5FF`), hot pink (`#FF10F0`), purple (`#B01EFF`), and green (`#39FF14`).
- **Components**:
  - Glassmorphism cards with `backdrop-blur`, semi-transparent surfaces, and neon borders/glows where appropriate.
  - Framer Motion for page transitions and key component animations; keep animations performant and purposeful.
  - Monaco editor themed to match the neon dark aesthetic.

Follow Tailwind and component patterns already established in existing components (landing, dashboards, cards) rather than introducing new ad-hoc design systems.

### 7. Working With the Current Codebase State

When wiring or extending existing modules, use these priorities:

- **Backend wiring**:
  - Connect existing models and services to FastAPI routers (e.g. battles, matchmaking, challenges, users) without changing their core intent.
  - Expose REST endpoints that mirror the data contracts described in `database_API.mdc`.
  - Add WebSocket endpoints for battles that delegate tick logic and state handling to `BattleManager` and Redis.
- **Matchmaking**:
  - Ensure the Matchmaker service is invoked from appropriate routers or background tasks, using Redis queues for pending players.
  - Respect ELO ranges, difficulty brackets, and permadeath checks before creating matches.
- **Execution workers**:
  - Implement the queue contract between the API and execution workers; workers should pull jobs, execute code in a sandbox, and push structured results back.
- **Frontend realtime**:
  - Integrate WebSocket connections into existing pages (e.g. battle arena, dashboard, problem details) using hooks/contexts.
  - Display live timers, test results, and outcome summaries consistent with the Gladiator game mode definition.

When unsure about behavior, consult `projectIDEA.mdc` first, then the rules `.mdc` files. Align naming and terminology (e.g. “organisms”, “traits”, “permadeath”, “Gladiator Arena”) with those documents.

### 8. Non-Goals and Boundaries

- Do not introduce new monetization mechanics, MMO-style world logic, or large tournament systems beyond what is described for the current phase, unless explicitly requested.
- Do not generate or modify production deployment/infra (K8s, CI/CD) in this skill; infra is handled manually and separately.
- Keep experimental or future-phase features behind clear flags or stubs so they do not complicate the MVP Gladiator + Evolution flows.

If a requested change appears to conflict with these boundaries, document the conflict in your response and propose a constrained, MVP-aligned alternative.

