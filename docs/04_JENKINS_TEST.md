# Jenkins Brutal Test - Complete Mastery Assessment

**Total:** 850 points across 5 levels

---

## Level 1: Jenkins Fundamentals (150 pts)

### 1.1 Core Concepts (10 pts each)

**1.1.1** What is Jenkins and why use it over manual deployments?

**1.1.2** Explain: Master, Agent (Node), Job, Pipeline, Build

**1.1.3** What's the difference between Freestyle Project and Pipeline?

**1.1.4** What port does Jenkins web UI run on by default?

**1.1.5** Where does Jenkins store job configurations and build history?

**1.1.6** What is a Jenkins plugin? Name 5 essential plugins.

**1.1.7** Explain CI/CD. How does Jenkins enable it?

**1.1.8** What is "Pipeline as Code"? Benefits?

**1.1.9** Declarative vs Scripted pipeline syntax - differences?

**1.1.10** What is Blue Ocean?

### 1.2 Installation & Setup (10 pts each)

**1.2.1** Write Docker command to run Jenkins locally with persistent storage

**1.2.2** How do you get the initial admin password after first install?

**1.2.3** What's the difference between "Install suggested plugins" vs "Select plugins"?

**1.2.4** How to access Jenkins if you forgot admin password?

**1.2.5** Command to restart Jenkins from CLI (Docker container)

---

## Level 2: Pipeline Development (200 pts)

### 2.1 Basic Jenkinsfile (15 pts each)

**2.1.1** Write Jenkinsfile to:
- Checkout Git repo
- Run `npm install`
- Run `npm test`
- Archive `dist/` folder

**2.1.2** Add email notification on build failure

**2.1.3** Add environment variables: `NODE_ENV=production`, `API_URL=https://api.com`

**2.1.4** Use Docker agent with `node:20-alpine` image

### 2.2 Advanced Pipeline Features (20 pts each)

**2.2.1** Write pipeline with 3 parallel stages:
- Unit tests
- Integration tests  
- Linting

**2.2.2** Add manual approval before "Deploy to Production" stage WITH input parameters:
- Environment choice: staging/production
- Version number input

**2.2.3** Implement retry logic: Retry deployment 3 times with 30 second delay between attempts

**2.2.4** Add when conditions:
- Deploy to staging only on `develop` branch
- Deploy to production only on `main` branch AND tag matches `v*`

**2.2.5** Handle failures gracefully:
- Try deploying
- If fails, rollback to previous version
- Send Slack notification with error details

---

## Level 3: Real-World Implementation (200 pts)

### 3.1 Microservices Pipeline (40 pts)

**Task:** Write complete Jenkinsfile for CodeArena with:

**Requirements:**
- Build 5 Docker images in parallel (auth, battle, execution, rating, websocket)
- Tag with build number
- Run integration tests with docker-compose
- Push to DockerHub (use credentials)
- Deploy to staging automatically
- Deploy to production with manual approval
- Send Slack notification on success/failure

**Your Jenkinsfile:**
```groovy
// Write here
```

### 3.2 Multi-Environment Deployment (30 pts)

**Task:** Configure pipeline to deploy to different environments:
- Feature branches → Deploy to feature-{branch-name} namespace
- `develop` branch → Deploy to staging
- `main` branch → Deploy to production (with approval)
- Tags (v1.0.0) → Create release

**Implementation:**

### 3.3 Security Scanning (30 pts)

**Task:** Add security scanning to pipeline:
- Scan Docker images for vulnerabilities
- Run npm audit
- Fail build if critical vulnerabilities found
- Generate security report

**How would you implement this?**

### 3.4 Database Migrations (30 pts)

**Task:** Safe database migration in pipeline:
- Backup database before migration
- Run Prisma migrations
- Verify migration success
- Rollback if migration fails

**Your approach:**

### 3.5 Blue-Green Deployment (40 pts)

**Task:** Implement blue-green deployment:
- Deploy new version to "green" environment
- Run smoke tests on green
- Route 10% traffic to green
- Monitor for errors
- If success: Route 100% to green
- If failure: Rollback to blue

**Design your pipeline:**

### 3.6 Secrets Management (30 pts)

**Task:** Handle secrets securely:
- Database password
- AWS access keys
- DockerHub credentials
- API keys

**Questions:**
1. Where to store secrets in Jenkins? (5 pts)
2. How to use secrets in Jenkinsfile? (10 pts)
3. How to pass secrets to Docker containers? (10 pts)
4. Security best practices? (5 pts)

---

## Level 4: Debugging & Troubleshooting (150 pts)

### 4.1 Build Failures (25 pts each)

**4.1.1 Problem:** Pipeline fails with:
```
ERROR: Cannot connect to Docker daemon
```
**Diagnose and fix:**

**4.1.2 Problem:** Build hangs at "Checking out Git repository" forever
**What to check? How to fix?**

**4.1.3 Problem:** Tests pass locally but fail in Jenkins
**List 10 possible causes:**

**4.1.4 Problem:** Jenkins shows "No space left on device"
**How to check? How to clean up?**

**4.1.5 Problem:** Pipeline crashes with:
```
java.io.IOException: error=12, Cannot allocate memory
```
**What's wrong? How to fix?**

**4.1.6 Problem:** Credentials work in Jenkins UI but fail in pipeline
**Why? How to debug?**

---

## Level 5: Advanced Scenarios & Architecture (150 pts)

### 5.1 Design Questions (30 pts each)

**5.1.1 Multi-Team Jenkins Setup**
**Scenario:** 5 development teams, 100+ developers

**Design:**
- How to organize jobs?
- Access control strategy?
- Resource allocation?
- Plugin management?
- Backup strategy?

**5.1.2 High-Availability Jenkins**
**Requirements:**
- Zero downtime for builds
- Disaster recovery
- Handle 1000 builds/day
- Geographic distribution

**Your architecture:**

**5.1.3 Hybrid Cloud Pipeline**
**Challenge:** Deploy to multiple clouds:
- AWS (production)
- Azure (staging)
- GCP (testing)
- On-premise (legacy systems)

**How to design pipeline?**

**5.1.4 Compliance & Audit**
**Requirements:**
- Track who deployed what, when
- Approval workflows
- Change logs
- Rollback ability
- SOC2 compliance

**Implementation plan:**

**5.1.5 Cost Optimization**
**Scenario:** Jenkins bill is $10,000/month

**How to reduce costs?**
- Agent optimization
- Build caching
- Artifact management
- Resource scheduling

---

## Level 6: Expert Challenges (100 pts - BONUS)

### 6.1 Custom Plugin Development (50 pts)

**Task:** Design custom Jenkins plugin that:
- Automatically detects flaky tests
- Quarantines failing tests
- Notifies developers
- Generates flaky test report

**What APIs would you use? Basic structure?**

### 6.2 Jenkins as Code (50 pts)

**Task:** Manage entire Jenkins configuration as code:
- Jobs
- Plugins
- Credentials
- System settings
- Users/permissions

**Which tools? How to implement?** (Hint: JCasC, Job DSL)

---

## Scenario-Based Questions (Throughout All Levels)

### Scenario 1: Production is Down! (30 pts)

**Situation:**
- 3 AM, production crash
- Last deployment was 2 hours ago
- Jenkins shows build succeeded
- Customers complaining

**Your response:**
1. Immediate actions? (10 pts)
2. How to investigate using Jenkins? (10 pts)
3. Rollback strategy? (10 pts)

### Scenario 2: Resource Exhaustion (25 pts)

**Problem:**
- Jenkins server CPU at 100%
- 50 builds queued
- Build times increased 10x

**Debug plan:**

### Scenario 3: Security Breach (30 pts)

**Alert:** Unknown IP accessed Jenkins, ran malicious pipeline

**Response plan:**
1. Immediate containment
2. Investigation
3. Remediation
4. Prevention

---

## Complete Implementation Task (100 pts)

### Build Production-Grade Jenkins Setup

**Task:** Document complete Jenkins setup for CodeArena including:

1. **Infrastructure** (20 pts)
   - Master + 3 agents architecture
   - Resource allocation
   - Networking

2. **Security** (20 pts)
   - Authentication (LDAP/SSO)
   - Authorization (role-based)
   - Credentials management
   - Network security

3. **Pipeline** (30 pts)
   - Complete Jenkinsfile for all services
   - All stages: build, test, scan, deploy
   - All environments: dev, staging, prod

4. **Integrations** (15 pts)
   - GitHub webhooks
   - Slack notifications
   - Monitoring (Prometheus)
   - Logging (ELK)

5. **Disaster Recovery** (15 pts)
   - Backup strategy
   - Restoration procedure
   - Failover plan

**Your complete design:**

---

## Scoring

**Total:** _____ / 850 (+ 100 bonus)

**Levels:**
- 850-900: **JENKINS MASTER** 🏆 - Hire this person!
- 750-849: **EXPERT** 💪 - Production-ready
- 650-749: **ADVANCED** ✅ - Can handle most scenarios
- 550-649: **INTERMEDIATE** 📚 - Keep practicing
- 450-549: **BEGINNER** 🎓 - Review fundamentals
- <450: **RETRY** 🔄 - Study guide again

---

## How to Submit

**DO NOT create answer file!**

This test is self-assessment. Compare your answers with:
1. Jenkins official docs
2. Your working implementations
3. Production scenarios

**Real test:** Can you build working Jenkins pipelines for CodeArena?

---

## Practical Validation

After finishing test, prove your knowledge:

**✅ Task 1:** Set up Jenkins locally with Docker
**✅ Task 2:** Create pipeline for one CodeArena service
**✅ Task 3:** Add tests + deployment
**✅ Task 4:** Implement parallel builds for all services
**✅ Task 5:** Add Slack notifications
**✅ Task 6:** Set up multibranch pipeline
**✅ Task 7:** Deploy to "staging" (your laptop counts!)

**If you can do all 7 → You pass regardless of written test score!**

---

## Next Steps

**Passed?** → Proceed to `05_TERRAFORM_GUIDE.md`

**Failed?** → Review `04_JENKINS_GUIDE.md`, build real pipelines, retry

**Want more?** → 
- Build Jenkins shared library
- Set up Jenkins agents cluster
- Implement GitOps with Jenkins

---

**Remember:** Jenkins is learned by doing, not just reading! 

**Lab exercises > Theory** 💪
