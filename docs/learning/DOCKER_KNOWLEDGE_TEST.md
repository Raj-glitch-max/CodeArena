# 🔥 Docker Knowledge Test - Session 1
**Date:** 2026-02-09  
**Student:** Raj  
**Topic:** Docker Fundamentals to Production

---

## Round 1: Fundamentals (Easy - Answer These NOW)

**Time Limit: 10 minutes total**

### Q1: Container vs VM
Draw (text diagram) the architecture difference between:
- Running 3 apps in 3 VMs
- Running 3 apps in 3 Docker containers

**What's the key architectural difference?**
text
┌──────────────────────────────────────────────────────────────┐
│                    3 VMs (HEAVY)                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   VM 1     │  │   VM 2     │  │   VM 3     │             │
│  │            │  │            │  │            │             │
│  │  Auth App  │  │ Battle App │  │WebSocket   │             │
│  │  (Node.js) │  │  (Node.js) │  │   App      │             │
│  │            │  │            │  │  (Node.js) │             │
│  │  Binaries  │  │  Binaries  │  │  Binaries  │             │
│  │  Libraries │  │  Libraries │  │  Libraries │             │
│  │            │  │            │  │            │             │
│  │  Guest OS  │  │  Guest OS  │  │  Guest OS  │             │
│  │ (Ubuntu 2GB│  │(Ubuntu 2GB)│  │(Ubuntu 2GB)│             │
│  └────────────┘  └────────────┘  └────────────┘             │
│         ↓               ↓               ↓                     │
│            Hypervisor (VMware/VirtualBox)                     │
│                       ↓                                        │
│                   Host OS                                      │
│                       ↓                                        │
│                   Hardware                                     │
└──────────────────────────────────────────────────────────────┘

Total Size: 6GB (3 × 2GB)
Boot Time: 90-180 seconds
RAM: 6GB (3 × 2GB)
text
┌──────────────────────────────────────────────────────────────┐
│              3 CONTAINERS (LIGHTWEIGHT)                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │Container 1 │  │Container 2 │  │Container 3 │             │
│  │            │  │            │  │            │             │
│  │  Auth App  │  │ Battle App │  │WebSocket   │             │
│  │  (Node.js) │  │  (Node.js) │  │   App      │             │
│  │            │  │            │  │  (Node.js) │             │
│  │  Binaries  │  │  Binaries  │  │  Binaries  │             │
│  │  Libraries │  │  Libraries │  │  Libraries │             │
│  │            │  │            │  │            │             │
│  │ (200MB)    │  │ (200MB)    │  │ (200MB)    │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│         ↓               ↓               ↓                     │
│              Docker Engine (Shared Kernel)                    │
│                       ↓                                        │
│                   Host OS (Linux)                             │
│                       ↓                                        │
│                   Hardware                                     │
└──────────────────────────────────────────────────────────────┘

Total Size: 600MB (3 × 200MB)
Boot Time: 1-3 seconds
RAM: 600MB (3 × 200MB)
---

### Q2: Docker Image Layers
You run these commands:
```dockerfile
FROM node:18-alpine
RUN npm install express
RUN npm install postgres
COPY . .
```

**Questions:**
1. How many layers does this create? 4
2. What happens when you change your source code and rebuild? the upper layers are already cached just the copy . . layer gets executed and copy the updateted code 
3. Which layers are rebuilt? Which are cached?
the libraries and dependecies are cached and only the code copy layer gets rebuilt

---

### Q3: The Root User Problem
You build this Dockerfile:
```dockerfile
FROM node:18-alpine
COPY . .
RUN npm install
CMD ["node", "index.js"]
```

**Questions:**
1. What user does the container run as? root
2. Why is this a security problem? if someone breaks he will get root acess to everything and can do anything with not only  the docker but with code and services
3. How do you fix it? we create a user and add in to the grp 
i actully confused about the addgrp 1001 and user 1001

---

## Round 2: Intermediate (Medium - Think Carefully)

### Q4: Multi-Stage Builds
**Scenario:** Your auth-service Dockerfile produces a 1.2GB image.

**Questions:**
1. Why is it so large? What's probably in there? so the first cause coul be the libraries or dependencies we are builting and installing may be unessacry like dev-prod dependencies or full node librariw
2. Explain multi-stage builds. What problem do they solve?
so in multistage we built the dev-prod libraies and dependencies and run it seperatly and just store the saved code in dist 
so that in next stage we onlt eun production specific dependencies and the slim version of the libraries which is more than enough and save space
and then we just copy the code from dist from the first stage of builder 
which then takes les time and and when we run again it inly builts or run the final image or final clean product not everything
3. What goes in the "builder" stage vs "runtime" stage?  in builder there are the Workshop" – tools, raw materials
and in runtime final product, clean, minimal

4. What size should the final image be for a Node.js app? (Ballpark)
120 to 200mb

---

### Q5: Node Modules in Docker
You have this Dockerfile:
```dockerfile
FROM node:18-alpine
COPY . .
RUN npm install
CMD ["node", "src/index.js"]
```

**Questions:**
1. What's wrong with this approach? we are copying the code directlt first before instaling npm 
it will take time everytime we run it and takes up so much space everytime
2. Why is Docker layer caching important for npm install?  beacuse the libraries and dependencies rarely changes so no really need to istall them again and alaso they take so much time to install and space
3. Fix this Dockerfile to optimize layer caching. 
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "src/index.js"]

---

### Q6: Environment Variables
Your auth-service needs:
- DATABASE_URL
- JWT_SECRET
- REDIS_URL

**Questions:**
1. Should these go IN the Dockerfile? Why or why not? no this shold go while runtime which is said to be the best practice though we can include them in docker file but it is said to be best practice to include the volume network and env while runtime for security reason or we can use secret manager 
2. Three ways to pass env vars to containers - name them.
first while runtime direct 
seceret manager we have to only use the keys names
like $(DATABASE_URL)
or in the file itself
3. Which approach do you use for secrets? Why?
i prefer runtime forlocally testing and secrets manager for prod for securit and easy debugging

---

## Round 3: Production Thinking (Hard - No Mercy)

### Q7: The .dockerignore File
**Questions:**
1. What is it? Why does it exist? so when we do COPY . .  obviouly ther are many things which are unnesscary in the local project file and which is again builted in the continer by itself like .git node_modules/
.env
.test files and other dev-prod unnessarcy testing and stufff files
2. List 5 things that should NEVER be in a Docker image.
.git 
.env
node_modules
dist/
dockerfile itself
and any testing or dockerignore files itself
also then env local and other small things too
3. What happens if you forget to ignore node_modules?
it will take so much space and time to built

---

### Q8: Container Startup Failure
You deploy your auth-service container. It shows "Running" but crashes after 10 seconds.

**Debug process:**
1. What commands do you run to investigate?
first docker logs conatiner name
then i will see what the issue is 
most likely port conflict or env not found then i will check docker file for env key name
and for port docker ps and ps -a and lsof -i perticular port
evenif not i will check docker history too
2. How do you see the logs?
docker logs auth_service
3. How do you check if it's a networking issue? 
i will exec in to it and curl or pick services from there to other
4. How do you exec into the running container?
docker exec -it auth_service bash

---

### Q9: Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1
```

**Questions:**
1. What does this do? so ot runs the health check in every 30 sec and if it shows nothin in 3 sec it mark it as fail 
so it pings the health url queitly no output is recorded and doesnt download anyhting just checks response of http and it tries only 1 time and if exit code = 0 the it is healthy 
2. Why --interval=30s? Why not 1s? the to run the cmd or to ping it atleat takes some   time 
3. What happens when health check fails 3 times in a row? doesnt matter there is no specification about it in the dockerfile where as it tries only for 1 time
and usuallly the conatiner is stopped 
4. Should EVERY container have a health check? Why/why not? yes i asnwered it above already

---

### Q10: Production Image Optimization
Your auth-service Dockerfile runs in production.

**Questions:**
1. Why use `node:18-alpine` instead of `node:18`? beacause first the alpine image is smaller verison of node which normally includes whatever is needed which saves the space
2. What's the size difference? (Approximate) 200mb(alpine) to 1.2 gb
3. What's the security benefit of Alpine? it doesnt incude everything 
4. Are there any downsides to Alpine? yes some kind of cmds or libraries are not present which need to be installed manully

---

## Round 4: Architecture & Trade-offs (FAANG Level)

### Q11: Build Context
You're in `/home/raj/Documents/PROJECTS/codebattle` and run:
```bash
docker build -f backend/services/auth-service/Dockerfile .
```

**Questions:**
1. What is the "build context"? the DockerFile
2. What gets sent to Docker daemon? Docker sends this entire folder to the Docker daemon:
source code
Dockerfile
config files
assets, etc.
Then COPY / ADD instructions can use those files.
3. Why is this slow if the project is huge? caue first time the dependecies and libraries takes time to download and to copy
4. How do you fix it?
by using multistage builts and using .dockerignore 

---

### Q12: Container Networking
You have 3 containers:
- auth-service (needs postgres)
- postgres
- redis

**Questions:**
1. How do containers discover each other? by being in the same network
becaue they are isolated
2. Can auth-service connect to `localhost:5432`? Why not? no we need to map it because the 5432 port of conatiner is  not the same local host of our machine
3. What's the correct connection string? postgresql://user:password@postgres:5432/dbname
Where postgres is the container hostname. 5432:5432
4. What's a Docker network? When do you need custom networks?  A Docker network is a virtual network layer that allows containers to:
communicate with each other
isolate traffic
use internal DNS (container names as hostnames)
You create custom networks when:
Multiple containers must talk securely (e.g., app + DB + cache)
Isolation is required (separate frontend/backend networks)
Service discovery via container names is needed
Multi-container apps (Docker Compose, microservices)

---

### Q13: Data Persistence
Your postgres container crashes. All data is lost.

**Questions:**
1. Why did this happen? Because Postgres data wasn’t persisted in a Docker volume. Container filesystem is ephemeral, so removing/crashing the container deletes stored data.
2. What's a Docker volume? A Docker volume is persistent storage separate from containers that ensures data survives container restarts, crashes, or recreations.
3. Volume vs bind mount - when do you use each? Volumes = persistent managed storage (production DBs).
Bind mounts = host file mapping (development/code sync).
4. Show the docker run command with a volume for postgres. docker run -d \
  --name postgres-db \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres


---

### Q14: Production Deployment Decision
You're deploying auth-service to production.

**Choice A:** Run `npm run dev` in container   
**Choice B:** Compile TypeScript, run `node dist/index.js`  

**Questions:**
1. Which do you choose? Why?  choice B short answer cuz i a tied of writting bc
no rollback in npmrundev time taken so much 
works no my machine but not others and manymore
2. What are the downsides of running dev mode in production? becasue so much unessarcy stuff like files scripts dependencies
3. How do you handle TypeScript compilation in Dockerfile? uhhhhhhhhhh i am tired of writing 
TypeScript is compiled during the Docker build stage using tsc, typically in a multi-stage build so only compiled JavaScript and production dependencies go into the final image.

---

### Q15: Security Hardening
**Scenario:** Security team audits your Dockerfile.

**They ask:**
1. Why are you running as root? beacuse i havent created a user
2. Why is the filesystem writable? beacuse i have given changed the file permissions it have rwx acesss
3. Why are there development dependencies in production image? because i didnt built multistage docker file
4. Why is the image 800MB for a simple Node.js app? becasue i used full  nodejs library

**How do you fix ALL of these issues?**
create a user and put him in to a group
give onlt what needed of acess like 744
make multistage builts with builder and runtime seperation
use nodejs alpine

---

## SCORING

**Answer ALL questions.** 

For each round:
- Round 1: If you miss >2, Docker fundamentals are weak
- Round 2: If you miss >2, not ready for production
- Round 3: If you miss >2, will fail interviews
- Round 4: If you miss >2, need more research

**No Google. No looking at docs. From memory. Go.**

---

**START TIMER. You have 45 minutes total. BEGIN.**
bc  just writing the asnwer took me so much time genuinly i not even thinked much still what is the time
