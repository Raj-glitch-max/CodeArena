# CI/CD Brutal Test

**Total:** 600 points

---

## Level 1: Basics (100 pts)

### 1.1 What triggers `on: push: branches: [main]`? (10 pts)
**Your answer:**

### 1.2 Difference between `runs-on: ubuntu-latest` vs `self-hosted`? (10 pts)
**Your answer:**

### 1.3 What is `actions/checkout@v3`? (10 pts)
**Your answer:**

### 1.4 How to pass secrets to workflow? (10 pts)
**Your answer:**

### 1.5 What is a matrix strategy? Give example. (10 pts)
**Your answer:**

### 1.6 Explain `needs: test` in a job (10 pts)
**Your answer:**

### 1.7 What is `${{ github.sha }}`? (10 pts)
**Your answer:**

### 1.8 How to run workflow on schedule (daily at 2 AM)? (10 pts)
**Your answer:**

### 1.9 What is cache in GitHub Actions and why use it? (10 pts)
**Your answer:**

### 1.10 Difference between `if: success()` and `if: always()`? (10 pts)
**Your answer:**

---

## Level 2: Build Pipelines (150 pts)

### 2.1 Test on every push (25 pts)
**Task:** Write workflow to test Node.js app on push to any branch

**Your workflow:**
```yaml

```

---

### 2.2 Build and push Docker (25 pts)
**Task:** Build Docker image and push to DockerHub when you push a tag (v1.0.0)

**Your workflow:**
```yaml

```

---

### 2.3 Multi-environment deployment (25 pts)
**Task:** Deploy to staging on push to `develop`, production on push to `main`

**Your workflow:**
```yaml

```

---

### 2.4 Matrix testing (25 pts)
**Task:** Run tests in parallel for Node versions 18, 19, 20

**Your workflow:**
```yaml

```

---

### 2.5 Database migrations (25 pts)
**Task:** Create workflow that runs Prisma migrations before deploying backend

**Your workflow:**
```yaml

```

---

### 2.6 Manual approval (25 pts)
**Task:** Implement manual approval step before production deployment

**Your workflow:**
```yaml

```

---

## Level 3: Debugging (150 pts)

### 3.1 Authentication failure (25 pts)
**Problem:** Workflow runs but Docker build fails:
```
Error: denied: requested access to the resource is denied
```

**What's wrong? How to fix?**

---

### 3.2 The CI/local gap (25 pts)
**Problem:** Tests pass locally (`npm test`) but fail in GitHub Actions

**List 10 possible causes:**
1.
2.
...

---

### 3.3 Silent failure (25 pts)
**Problem:** Deployment workflow shows success ✅ but app is  crashed on server

**How to debug? How to prevent?**

---

### 3.4 Cost explosion (25 pts)
**Problem:** GitHub Actions bill jumped to $500/month

**How to identify what's using minutes? How to reduce cost?**

---

### 3.5 Fork security (25 pts)
**Problem:** PR from external fork can't access secrets

**Why is this? What are security implications? How to handle?**

---

### 3.6 Workflow won't trigger (25 pts)
**Problem:** Created `.github/workflows/deploy.yml` but it never runs

**Debug checklist (10 things to check):**
1.
2.
...

---

## Level 4: Advanced Scenarios (150 pts)

### 4.1 Blue-green deployment (40 pts)
**Task:** Design GitHub Actions workflow for blue-green deployment with automatic rollback if health check fails

**Your design:**

---

### 4.2 Canary deployment (40 pts)
**Task:** Implement canary deployment (10% traffic to new version, monitor, then 100%)

**Your workflow:**

---

### 4.3 Multi-environment pipeline (35 pts)
**Task:** Create pipeline for dev → staging (auto) → production (manual approval)

**Your complete workflow:**

---

### 4.4 Custom action (35 pts)
**Task:** Create reusable custom action for deploying to EC2 via SSH

**Your action.yml:**

---

## Level 5: Production Mastery (50 pts)

### 5.1 Complete microservices CI/CD (50 pts)
**Challenge:** Design complete CI/CD for CodeArena:
- Test all services
- Build Docker images
- Deploy to staging
- Run integration tests
- Manual approval for production
- Deploy to production
- Health checks
- Rollback on failure
- Slack notifications

**Your complete pipeline:**

---

## Scoring

**Total:** _____ / 600

- 600-540: **LEGEND** 🏆
- 539-450: **MASTER** 💪
- 449-350: **PASS** ✅
- <350: **RETRY** 🔄

---

**Next:** If passed, move to **05_TERRAFORM_GUIDE.md**
