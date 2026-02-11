# 🏗️ CodeArena - COMPLETE SYSTEM DOCUMENTATION
> **Everything you need to know before Docker/DevOps work**

**Last Updated:** 2026-02-09  
**Status:** 🟢 Fully Investigated  
**Purpose:** Complete foundation knowledge for DevOps implementation

---

## 📊 SYSTEM OVERVIEW

**What is CodeArena?**
A real-time 1v1 competitive coding platform where users:
1. Register/login
2. Enter matchmaking queue
3. Get matched with opponent of similar skill
4. Both solve the same coding problem
5. First to solve correctly wins
6. ELO rating updates based on results

---

## 🔧 SERVICES ARCHITECTURE

### Complete Service Map

```
Frontend (React)
    ↓ HTTP/WebSocket
WebSocket Server (Port 3000) ←→ Redis (Pub/Sub)
    ↓
Auth Service (Port 3001) ←→ PostgreSQL
Battle Service (Port 3002) ←→ PostgreSQL  
Execution Service (Port 3003) ←→ RabbitMQ
Rating Service (Port 3004) ←→ PostgreSQL + Redis
Matchmaking Service (NOT IMPLEMENTED YET)
```

---

## 📦 SERVICE DETAILS

### 1. Auth Service (Port 3001) ✅ WORKING

**Purpose:** User authentication and authorization

**What it does:**
- User registration with bcrypt password hashing
- User login with JWT token generation
- Token validation middleware
- User profile management

**Dependencies:**
- PostgreSQL (Users table)
- Redis (Session caching - optional)

**API Endpoints:**
```
POST /api/auth/register - Create new user
POST /api/auth/login - Login and get JWT
GET /api/auth/me - Get current user (requires JWT)
GET /api/auth/profile/:username - Get user profile
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6380
PORT=3001
```

**Test Commands:**
```bash
# Health check
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"pass123"}'
```

---

### 2. Battle Service (Port 3002) ✅ WORKING

**Purpose:** Manage battle lifecycles and problem selection

**What it does:**
- Creates battles between two players
- Assigns random problems based on difficulty
- Tracks battle status (countdown, active, completed)
- Retrieves battle details and history
- Updates battle status

**Dependencies:**
- PostgreSQL (Battles, Problems, TestCases, Submissions tables)
- Requires REAL user IDs (foreign key constraints)

**API Endpoints:**
```
GET /api/problems/random?difficulty=easy - Get random problem
POST /api/battles - Create new battle (requires valid user IDs)
GET /api/battles/:id - Get battle by ID
PATCH /api/battles/:id/status - Update battle status
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=3002
```

**Database Requirements:**
- Users must exist in database (foreign key: player1Id, player2Id)
- Problems and TestCases must be seeded
- Battle requires: player1Id, player2Id, problemId, difficulty, mode

**Test Commands:**
```bash
# Health check
curl http://localhost:3002/health

# Get random problem
curl http://localhost:3002/api/problems/random?difficulty=easy

# Create battle (requires existing user IDs)
# First get user IDs from database or auth registration
curl -X POST http://localhost:3002/api/battles \
  -H "Content-Type: application/json" \
  -d '{
    "player1Id":"<real-user-id>",
    "player2Id":"<real-user-id>",
    "difficulty":"easy",
    "mode":"ranked"
  }'
```

---

### 3. WebSocket Server (Port 3000) ⚠️ NEEDS REDIS

**Purpose:** Real-time communication between clients and services

**What it does:**
- Authenticates socket connections via JWT
- Handles matchmaking events
- Handles battle events (code submissions, opponent progress)
- Broadcasts events via Redis pub/sub for horizontal scaling
- Real-time notifications to clients

**Dependencies:**
- Redis (CRITICAL - for pub/sub)
- JWT for socket authentication

**Events:**
```
Client → Server:
- join_matchmaking
- leave_matchmaking
- submit_code
- join_battle
- leave_battle

Server → Client:
- match_found
- battle_started
- opponent_submitted
- battle_completed
- test_result
```

**Environment Variables:**
```env
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6380
```

**Requirements:**
- Redis MUST be running (pub/sub for events)
- Client must send JWT token on connection
- Subscribes to Redis channel: `battle:events`

---

### 4. Execution Service (Port 3003) ⚠️ NEEDS RABBITMQ

**Purpose:** Execute user code securely and return results

**What it does:**
- Receives code execution requests via REST API
- Publishes to RabbitMQ queue for worker processing
- Workers execute code in sandboxed environment
- Runs code against test cases
- Returns pass/fail results with errors

**Dependencies:**
- RabbitMQ (CRITICAL - message queue for async execution)
- Docker (for sandboxed code execution - NOT YET IMPLEMENTED)

**API Endpoints:**
```
POST /api/execute - Execute code
GET /api/execute/:submissionId - Get execution result
```

**Environment Variables:**
```env
PORT=3003
RABBITMQ_URL=amqp://localhost:5672
```

**Current Status:**
- Connects to RabbitMQ on startup
- If RabbitMQ not running, service fails to start
- Code execution sandbox NOT FULLY IMPLEMENTED (security risk!)

---

### 5. Rating Service (Port 3004) ✅ WORKING

**Purpose:** Calculate ELO ratings and manage leaderboards

**What it does:**
- Calculates rating changes using ELO algorithm
- Updates user ratings after battles
- Manages leaderboard in Redis (sorted set)
- Tracks user statistics (wins, losses, total battles)

**Dependencies:**
- PostgreSQL (Users table for rating updates)
- Redis (Leaderboard caching)

**API Endpoints:**
```
POST /api/rating/calculate - Calculate rating change
POST /api/rating/update - Update user ratings
GET /api/rating/leaderboard - Get top players
GET /api/rating/user/:userId - Get user rating info
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6380
PORT=3004
```

---

### 6. Matchmaking Service ❌ NOT IMPLEMENTED

**Status:** Directory exists but is EMPTY

**What it should do:**
- Match players based on rating
- Create matchmaking queue
- Handle timeout/cancellation
- Call battle service when match found


---

## 🗄️ DATABASE STRUCTURE (PostgreSQL)

### Tables & Relationships

```
users (Auth, Ratings)
  ├─ id (UUID, PK)
  ├─ username (unique)
  ├─ email (unique)
  ├─ passwordHash
  ├─ rating (default: 1200)
  ├─ rank (default: "bronze")
  ├─ wins, losses, totalBattles
  └─ createdAt, updatedAt

problems (Battle Problems)
  ├─ id (UUID, PK)
  ├─ title ("Two Sum")
  ├─ slug ("two-sum")
  ├─ difficulty (easy/medium/hard)
  ├─ description
  ├─ templateJs, templatePy, templateJava, templateCpp
  └─ constraints, hints, examples

testCases (Problem Test Cases)
  ├─ id (UUID, PK)
  ├─ problemId (FK → problems)
  ├─ input, output
  ├─ isExample, isHidden
  └─ orderIndex

battles (Battle State)
  ├─ id (UUID, PK)
  ├─ player1Id (FK → users)
  ├─ player2Id (FK → users)
  ├─ problemId (FK → problems)
  ├─ mode (solo/ranked/practice)
  ├─ difficulty (easy/medium/hard)
  ├─ status (countdown/active/completed/abandoned)
  ├─ winnerId
  └─ startedAt, completedAt

submissions (Code Submissions)
  ├─ id (UUID, PK)
  ├─ battleId (FK → battles)
  ├─ userId (FK → users)
  ├─ code, language
  ├─ testsPassed, testsTotal
  ├─ completionTime (ms from battle start)
  ├─ status (pending/running/completed/error)
  └─ submittedAt
```

---

## 🐳 DOCKER INFRASTRUCTURE (Current State)

**Running Containers:**
```bash
docker ps -a

# PostgreSQL (codebattle-postgres) - ✅ RUNNING
- Image: postgres:16-alpine
- Port: 5432:5432
- Status: Healthy
- Contains: All tables with seed data

# Redis (codebattle-redis) - ❌ STOPPED
- Image: redis:7-alpine  
- Port: 6380:6379
- Status: Exited (NOT RUNNING)
- Used by: WebSocket, Rating service

# RabbitMQ (codebattle-rabbitmq) - ❌ STOPPED
- Image: rabbitmq:3-management-alpine
- Ports: 5672:5672 (AMQP), 15672:15672 (Management UI)
- Status: Exited (NOT RUNNING)
- Used by: Execution service
```

---

## 🚀 COMPLETE STARTUP SEQUENCE

### Prerequisites
```bash
# Docker containers must exist (they do)
docker ps -a | grep codebattle
```

### Step 1: Start Infrastructure (Order Matters!)

```bash
# 1. Start PostgreSQL (ALREADY RUNNING)
docker start codebattle-postgres

# 2. Start Redis (REQUIRED for WebSocket + Rating)
docker start codebattle-redis

# 3. Start RabbitMQ (REQUIRED for Execution)
docker start codebattle-rabbitmq

# Verify all running
docker ps
```

### Step 2: Start Services (Any Order After Infrastructure)

```bash
# Terminal 1: Auth Service
cd backend/services/auth-service
npm run dev
# ✅ Port 3001 - Depends on PostgreSQL

# Terminal 2: Battle Service
cd backend/services/battle-service
npm run dev
# ✅ Port 3002 - Depends on PostgreSQL

# Terminal 3: WebSocket Server
cd backend/services/websocket-server
npm run dev
# ⚠️ Port 3000 - Depends on Redis

# Terminal 4: Execution Service
cd backend/services/execution-service
npm run dev
# ⚠️ Port 3003 - Depends on RabbitMQ

# Terminal 5: Rating Service
cd backend/services/rating-service
npm run dev
# ✅ Port 3004 - Depends on PostgreSQL + Redis

# Terminal 6: Frontend
npm run dev
# Port 5173
```

---

## ⚠️ COMMON ERRORS & FIXES

### Error 1: "Can't reach database server at localhost:5432"
**Cause:** PostgreSQL not running  
**Fix:**
```bash
docker start codebattle-postgres
docker ps | grep postgres  # Verify
```

### Error 2: WebSocket server fails with Redis error
**Cause:** Redis not running  
**Fix:**
```bash
docker start codebattle-redis
docker ps | grep redis  # Verify
```

### Error 3: Execution service "Failed to start server"
**Cause:** RabbitMQ not running  
**Fix:**
```bash
docker start codebattle-rabbitmq
# Check management UI: http://localhost:15672
# Default credentials: guest/guest
```

### Error 4: "Foreign key constraint violated: battles_player1_id_fkey"
**Cause:** Trying to create battle with non-existent user IDs  
**Fix:**
```bash
# Register real users first via auth service
# OR use existing user IDs from database:
psql -U postgres -d codebattle -c "SELECT id, username FROM users LIMIT 5;"
```

### Error 5: "Cannot POST /battles" (without /api)
**Cause:** Missing route prefix  
**Fix:** All services mount routes at `/api`:
- Auth: `/api/auth/*`
- Battle: `/api/battles/*`, `/api/problems/*`
- Execution: `/api/execute/*`
- Rating: `/api/rating/*`

---

## 🧪 VERIFICATION COMMANDS

### Check All Infrastructure
```bash
# PostgreSQL
docker exec codebattle-postgres psql -U postgres -d codebattle -c "SELECT COUNT(*) FROM users;"

# Redis
docker exec codebattle-redis redis-cli PING

# RabbitMQ
docker exec codebattle-rabbitmq rabbitmqctl status
```

### Test All Services
```bash
# Auth
curl http://localhost:3001/health

# Battle
curl http://localhost:3002/health

# WebSocket (check terminal logs for "WebSocket server running")

# Execution
curl http://localhost:3003/health

# Rating
curl http://localhost:3004/health
```

---

## 📝 ENVIRONMENT VARIABLE SUMMARY

All services need `.env` files:

**Auth Service:**
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/codebattle
REDIS_URL=redis://localhost:6380
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3001
```

**Battle Service:**
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/codebattle
PORT=3002
```

**WebSocket Server:**
```env
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REDIS_URL=redis://localhost:6380
```

**Execution Service:**
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
PORT=3003
```

**Rating Service:**
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/codebattle
REDIS_URL=redis://localhost:6380
PORT=3004
```

---

## 🎯 WHAT'S MISSING (DevOps TODO)

### Not Implemented Yet:
1. ❌ Dockerfiles for each service
2. ❌ docker-compose.yml to orchestrate all services
3. ❌ Matchmaking service (directory empty)
4. ❌ Code execution sandbox (security risk!)
5. ❌ Automated database migrations in Docker
6. ❌ Health check endpoints for all services
7. ❌ Logging aggregation
8. ❌ Metrics/monitoring
9. ❌ CI/CD pipeline
10. ❌ Production deployment

### What Works Now:
1. ✅ Auth registration/login
2. ✅ Problem retrieval
3. ✅ Real-time WebSocket communication (if Redis running)
4. ✅ Database schema with relationships
5. ✅ Service-to-service API structure

---

## 🚀 NEXT PHASE: DOCKER

**What we'll build:**
1. Dockerfile for each service
2. Multi-stage builds for optimization
3. docker-compose.yml for full stack
4. Automated startup sequence
5. Health checks and dependencies
6. Environment variable management
7. Network configuration

**Goal:** `docker-compose up` brings entire stack online

---

**This document is your foundation. Everything you need to know before writing a single Dockerfile.**
