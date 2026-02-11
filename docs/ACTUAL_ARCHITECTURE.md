# 🏗️ CodeArena - ACTUAL ARCHITECTURE
> **This is REALITY, not fantasy. Document what EXISTS, not what we wish existed.**

**Last Updated:** 2026-02-09  
**Status:** 🔴 Under Investigation  
**Can it run?** Unknown - investigating

---

## 📊 CURRENT STATE ASSESSMENT

### What We Know For Sure
- [x] 6 microservices exist in `/backend/services/`
- [x] Frontend is React + TypeScript
- [x] PostgreSQL and Redis are required
- [ ] ??? Does it actually run end-to-end?
- [ ] ??? Are all services necessary?

### What We DON'T Know Yet
- [ ] How do services communicate?
- [ ] What's the actual data flow?
- [ ] What APIs exist?
- [ ] How is authentication handled?
- [ ] How does code execution actually work?

---

## 🔍 SERVICE INVESTIGATION

### 1. Auth Service
**Location:** `/backend/services/auth-service/`  
**Port:** ??? (FIND THIS)  3001

**What it does:**
```
TODO: Investigate the code and explain in YOUR OWN WORDS:
- What endpoints does it expose? idk
- How does registration work? idk
- How does login work?idk
- What gets stored in database? idk
- What gets cached in Redis? idk 
i dont know database and auth i neveer lerned them😭😭😭😭😭😭😭😭
```

**Dependencies:**
- [ ] PostgreSQL - Why? What tables?
- [ ] Redis - Why? What's cached?
- [ ] Other services? Which ones?

**How to run it:**
```bash
# Document the EXACT commands to start this service
# Test that they actually work

# TODO: Fill this in after experimentation
```

**Test it works:**
```bash
# Document a test curl/HTTP request
# Prove the service is responding

# TODO: Test and document
```

---

### 2. Battle Service
**Location:** `/backend/services/battle-service/`  
**Port:** ???

**What it does:**
```
TODO: Investigate and explain:
- What is a "battle"?
- How is a battle created?
- What's the lifecycle of a battle?
- What data is stored?
- How does it interact with other services?
```

**Dependencies:**
- [ ] What does it need to run?

**How to run it:**
```bash
# TODO: Document
```

---

### 3. Execution Service
**Location:** `/backend/services/execution-service/`  
**Port:** ???

**What it does:**
```
TODO: This is critical - understand code execution:
- How does user code get executed?
- Is it sandboxed? How?
- What languages are supported?
- How are test cases run?
- What happens if code has infinite loop?
- How is it secured?
```

**Dependencies:**
- [ ] Docker? (for code execution?)
- [ ] What else?

---

### 4. Rating Service  
**Location:** `/backend/services/rating-service/`  
**Port:** ???

**What it does:**
```
TODO: Understand the ELO system:
- How are ratings calculated?
- When does it get triggered?
- What's stored in database?
```

---

### 5. WebSocket Server
**Location:** `/backend/services/websocket-server/`  
**Port:** ???

**What it does:**
```
TODO: Real-time communication:
- What events are emitted?
- Who connects to it? (frontend? services?)
- How does it know about battle updates?
- What's the message flow?
```

---

### 6. Matchmaking Service
**Location:** `/backend/services/matchmaking-service/`  
**Port:** ???

**What it does:**
```
TODO: Player matching logic:
- How does matchmaking work?
- What's the matching algorithm?
- How are skill levels considered?
- How does it communicate with battle service?
```

---

## 🗃️ DATABASE INVESTIGATION

### PostgreSQL Schema
```
TODO: After examining Prisma schema or running migrations:

Tables:
1. users
   - Columns: ???
   - Purpose: ???

2. battles
   - Columns: ???
   - Purpose: ???

3. ???

Draw the table relationships:
(users) --1:N--> (battles)
     ???
```

### Redis Usage
```
TODO: What's being cached?
- Session data?
- Leaderboards?
- Real-time state?
- ???
```

---

## 🔄 ACTUAL DATA FLOW

### User Registration Flow
```
TODO: Trace through the code and document:

1. User fills form on frontend
2. Frontend POSTs to: ???
3. Auth service: ???
4. Database: ???
5. Response: ???
```

### Battle Creation Flow
```
TODO: Document the COMPLETE flow:

1. User clicks "Find Match"
2. ???
3. ???
4. Battle starts
```

### Code Execution Flow
```
TODO: This is the core feature - understand it completely:

1. User submits code
2. ???
3. Code gets executed (how? where?)
4. Results returned
5. Battle updated
```

---

## 🏗️ ARCHITECTURE DIAGRAM

### Current Architecture (As Discovered)
```
TODO: Draw this BY HAND on paper first, then create ASCII art or upload image

[Frontend]
    |
    v
  [???]  <-- What's the entry point?
    |
    v
[Services] <-- How do they communicate?
    |
    v
[Database]
```

### Service Communication
```
TODO: How do services talk to each other?
- Direct HTTP calls?
- Message queue (RabbitMQ)?
- Events?
- ???
```

---

## 🚦 STARTUP SEQUENCE

### What Must Start First?
```
TODO: Determine the dependency order:

1. PostgreSQL (database must exist)
2. Redis (caching layer)
3. ??? service (why?)
4. ??? service
5. ???

Document WHY this order matters.
```

### Environment Variables Needed
```
TODO: List ALL environment variables required:

Auth Service:
- DATABASE_URL=???
- REDIS_URL=???
- JWT_SECRET=???
- ???

Battle Service:
- ???
```

---

## ❌ CURRENT PROBLEMS/UNKNOWNS

### Broken/Missing Things
```
TODO: As you investigate, document what's broken:

1. No Dockerfiles - can't containerize
2. No docker-compose.yml - can't orchestrate
3. ???
```

### Questions That Need Answers
```
1. Does RabbitMQ exist anywhere? README mentions it.
2. How does frontend connect to backend? Proxy? Direct?
3. What's the production deployment story? (none, yet)
4. ???
```

---

## 📝 MANUAL STARTUP GUIDE

### Prerequisites
```bash
# What needs to be installed?
- Node.js v18+
- PostgreSQL (running on port 5432)
- Redis (running on port 6379)
- ???
```

### Step-by-Step Startup
```bash
# TODO: Document the EXACT steps you take to run this locally

# 1. Start PostgreSQL
# Document your command here

# 2. Start Redis  
# Document your command here

# 3. Set up database
# cd backend && ???

# 4. Start services (one terminal per service)
# Terminal 1:
cd backend/services/auth-service
npm install  # or bun install?
npm run dev  # or what command?

# Terminal 2:
???

# 5. Start frontend
???
```

### Verification Checklist
```
After startup, verify:
[ ] PostgreSQL is running: psql -U ??? -l
[ ] Redis is running: redis-cli ping
[ ] Auth service responds: curl http://localhost:???/health
[ ] Battle service responds: ???
[ ] Frontend loads: http://localhost:???
[ ] Can register a user
[ ] Can create a battle
[ ] Can execute code
```

---

## 🎯 NEXT STEPS

### Immediate Actions
1. **Fill in all the TODOs above** - This is your investigation phase
2. **Actually START each service** - Don't just read code, RUN it
3. **Test end-to-end flow** - Can you complete a full battle?
4. **Document what breaks** - Every error is a learning opportunity

### After Investigation
- Create startup script that automates this
- Begin containerization (Dockerfiles)
- Document pain points that DevOps will solve

---

## 📸 EVIDENCE

### Screenshots/Proofs
```
TODO: Take screenshots of:
- All services running (terminal screenshot)
- Database tables (pgAdmin or psql output)
- Successful API response
- Working frontend with battle flow
```

Upload these to `/docs/investigation/` and link them here.

---

## 💭 LEARNINGS & NOTES

### What I Discovered Today
```
TODO: Journal your discoveries:

Date: 2026-02-09
- Learned that auth-service uses JWT for ???
- Discovered that execution-service doesn't actually have Docker sandboxing yet
- Found out that ??? service is calling ??? service directly
```

### Surprises/Confusions
```
- Why are there 6 services when X and Y could be combined?
- How does ??? work exactly?
- ???
```

---

**Remember: This document should reflect TRUTH, not aspirations.**
**If you write "DON'T KNOW YET", that's perfectly fine.**
**The point is to discover what you don't know, so you can learn it.**
