# 🧠 DevOps Learning Log - CodeArena Project
> A record of every command, every error, and every victory

**Started:** 2026-02-09  
**Goal:** Build production-grade DevOps skills by deploying CodeArena

---

## 📅 Session 1: 2026-02-09 (Phase 0: Understanding)

### 🎯 Goals for Today
- Understand what CodeArena actually does
- Get auth-service running locally
- Debug why registration is failing

---

### 🔍 Discovery Phase

**Command 1: Investigate service ports**
```bash
cd /home/raj/Documents/PROJECTS/codebattle
bash docs/investigate.sh
```
**What happened:** Found all services and their ports
- WebSocket Server: Port 3000
- Auth Service: Port 3001
- Battle Service: Port 3002
- Execution Service: Port 3003
- Rating Service: Port 3004

**Why this matters:** Need to know ports to test services and configure networking later.

---

**Command 2: View Prisma database schema**
```bash
cat backend/services/auth-service/prisma/schema.prisma
```
**What happened:** Discovered database structure
- 5 tables: User, Problem, TestCase, Battle, Submission
- User starts with rating=1200, rank="bronze"
- Passwords are hashed (security!)
- Relations defined (users have battles, battles have submissions)

**Why this matters:** Schema shows what data exists and how services interact with database.

---

**Command 3: Start auth-service**
```bash
cd backend/services/auth-service
npm run dev
```
**What happened:** Service started on port 3001
**Error encountered:** None at startup, but...

---

### 🐛 First Bug: Registration Failed

**Command 4: Test registration endpoint**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"pass"}'
```
**What happened:** Got "Internal server error"

**Why:** Didn't check logs yet (rookie mistake!)

---

### 🔍 Debugging Process

**Command 5: Read auth-service logs**
```
(Looked at terminal where npm run dev was running)
```
**Error found:**
```
PrismaClientInitializationError: 
Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

**AHA MOMENT:** Auth service is running, but PostgreSQL is NOT!

**Why this matters:** Services have dependencies. Auth service NEEDS database to store users.

---

**Command 6: Check if PostgreSQL is installed/running**
```bash
sudo systemctl status postgresql
```
**Result:** `Unit postgresql.service could not be found.`

**Learning:** PostgreSQL not managed by systemctl on this system.

---

**Command 7: Check for Docker containers**
```bash
docker ps -a | grep postgres
```
**Result:**
```
16ba7b516e65   postgres:16-alpine   "Exited (255) 2 hours ago"   codebattle-postgres
```

**AHA MOMENT #2:** PostgreSQL EXISTS but it's STOPPED!
- Container name: `codebattle-postgres`
- Status: Exited
- Port mapping: 5432 (matches what auth-service expects)

**Why this matters:** Database exists, just needs to be started. Not a configuration problem, just a startup problem.

---

### ✅ The Fix

**Command 8: Start PostgreSQL container**
```bash
docker start codebattle-postgres
```
**Result:** `codebattle-postgres` (success!)

**Command 9: Verify it's running**
```bash
docker ps | grep postgres
```
**Result:**
```
16ba7b516e65   postgres:16-alpine   "Up 3 seconds (health: starting)"   0.0.0.0:5432->5432/tcp   codebattle-postgres
```

**Why this matters:** Always verify your fix worked before retrying the operation.

---

### 🎉 SUCCESS!

**Command 10: Test registration again**
```bash
bash docs/test-auth.sh
```

**Results:**
1. **Registration:** ✅ SUCCESS
   - Created user with id, username, email
   - Rating set to 1200 (default from schema)
   - Rank set to "bronze"
   - Received JWT token

2. **Login:** ✅ SUCCESS
   - Found existing user
   - Returned user data + JWT token

3. **Duplicate prevention:** ✅ SUCCESS
   - Tried to register same username
   - Got error: "Username or email already exists"
   - Validation working correctly!

---

### 📊 What I Learned Today

**DevOps Skills:**
1. **Reading logs** - Errors tell you exactly what's wrong
2. **Checking dependencies** - Service needs database to work
3. **Using Docker commands** - `docker ps -a` to see all containers, `docker start` to start them
4. **Systematic debugging** - Don't guess, investigate step by step
5. **Verifying fixes** - Always test after fixing

**Technical Understanding:**
1. **Service dependencies** - Auth service → PostgreSQL (data storage)
2. **Docker basics** - Containers can be stopped/started, ports are mapped
3. **Database schema** - Prisma schema defines tables and relationships
4. **API endpoints** - POST /api/auth/register and /api/auth/login work
5. **JWT authentication** - Service returns tokens for authenticated requests

**Mindset Shift:**
- Before: "I don't know databases 😭"
- After: "I can debug production issues!"
- Realization: You don't need to "know everything" - you need to READ ERRORS and INVESTIGATE

---

### 🎯 Next Steps

- [ ] Document Auth Service in ACTUAL_ARCHITECTURE.md
- [ ] Verify data in PostgreSQL database
- [ ] Investigate other services (Battle, Execution, Rating, WebSocket, Matchmaking)
- [ ] Map out service dependencies
- [ ] Create startup script to automate this process

---

### 💭 Questions for Later

1. Why did PostgreSQL stop? (Container exit after reboot?)
2. Do other services also depend on PostgreSQL?
3. Does anything depend on Redis?
4. What's RabbitMQ used for? (README mentioned it)
5. How do services communicate with each other?

---

## 📈 Progress Tracker

**Phase 0: Understanding** (In Progress)
- [x] Found all services and ports
- [x] Understood database schema
- [x] Started auth-service
- [x] Started PostgreSQL
- [x] Successfully tested registration + login
- [ ] Document Auth Service properly
- [ ] Test other services
- [ ] Map complete architecture
- [ ] Create startup automation

**Phase 1: Containerization** (Not Started)
**Phase 2: Deployment** (Not Started)
**Phase 3: Automation** (Not Started)
**Phase 4: Production** (Not Started)

---

## 🔖 Commands Reference

**Check Docker containers:**
```bash
docker ps           # Running containers
docker ps -a        # All containers (including stopped)
docker start <name> # Start a stopped container
docker logs <name>  # View container logs
```

**PostgreSQL:**
```bash
docker start codebattle-postgres  # Start database
docker ps | grep postgres         # Verify running
```

**Auth Service:**
```bash
cd backend/services/auth-service
npm run dev                       # Start service
```

**Test Auth:**
```bash
bash docs/test-auth.sh           # Run all auth tests
```

---

**End of Session 1**

---

*This log will be updated after every learning session. It's your proof of growth.*
