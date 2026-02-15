# CI/CD Mastery - GitHub Actions to Production

**Goal:** Automate everything from git push to production deployment

**What is CI/CD?**
- **CI (Continuous Integration):** Automatically test code on every commit
- **CD (Continuous Deployment):** Automatically deploy passing code to production

---

## Part 1: GitHub Actions Basics

### What are GitHub Actions?

Free CI/CD built into GitHub. Runs workflows when events happen (push, PR, schedule).

**Workflow:** YAML file defining what to run
**Job:** Group of steps that run together
**Step:** Individual command/action
**Runner:** Server that executes jobs (GitHub-hosted or self-hosted)

---

### First Workflow

**.github/workflows/test.yml**
```yaml
name: Run Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
```

**Trigger:** Push to main or PR to main
**What it does:** Checks out code, installs Node, runs tests

---

## Part 2: Building Docker Images

### Multi-service Build

**.github/workflows/build.yml**
```yaml
name: Build Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        service: [auth-service, battle-service, rating-service]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./backend/services/${{ matrix.service }}
          push: true
          tags: yourusername/${{ matrix.service }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

**Matrix strategy:** Runs job 3 times (once per service)
**Secrets:** Store in GitHub Settings → Secrets
**Tags:** Use git SHA for versioning

---

## Part 3: Deployment to EC2

### SSH Deployment

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/codearena
            git pull origin main
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

**Secrets needed:**
- `EC2_HOST`: Public IP or domain
- `EC2_SSH_KEY`: Private SSH key content

---

## Part 4: Environment Management

### Staging vs Production

```yaml
name: Deploy

on:
  push:
    branches:
      - main        # → production
      - staging     # → staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Set environment
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "ENV=production" >> $GITHUB_ENV
            echo "HOST=${{ secrets.PROD_HOST }}" >> $GITHUB_ENV
          else
            echo "ENV=staging" >> $GITHUB_ENV
            echo "HOST=${{ secrets.STAGING_HOST }}" >> $GITHUB_ENV
          fi
      
      - name: Deploy to ${{ env.ENV }}
        run: echo "Deploying to ${{ env.ENV }} at ${{ env.HOST }}"
```

---

## Part 5: Rollback Strategy

### Tagged Releases

```yaml
name: Deploy Release

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy version ${{ github.event.release.tag_name }}
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/codearena
            git fetch --all --tags
            git checkout tags/${{ github.event.release.tag_name }}
            docker-compose build
            docker-compose up -d
```

**Rollback:** Create release from old tag

---

## Part 6: Database Migrations

### Safe Migration Workflow

```yaml
jobs:
  migrate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Backup database
        run: |
          ssh ubuntu@${{ secrets.EC2_HOST }} \
            "docker exec postgres pg_dump -U postgres codearena > backup.sql"
      
      - name: Run migrations
        run: |
          ssh ubuntu@${{ secrets.EC2_HOST }} \
            "cd /home/ubuntu/codearena && \
             docker-compose exec -T auth-service npx prisma migrate deploy"
      
      - name: Verify
        run: |
          ssh ubuntu@${{ secrets.EC2_HOST }} \
            "curl -f http://localhost:3001/health || exit 1"
```

---

## Part 7: Monitoring & Notifications

### Slack Notifications

```yaml
jobs:
  deploy:
    steps:
      # ... deployment steps
      
      - name: Notify success
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Deployment successful: ${{ github.sha }}"
            }
      
      - name: Notify failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "❌ Deployment failed: ${{ github.sha }}"
            }
```

---

## Part 8: Complete Production Pipeline

**.github/workflows/production.yml**
```yaml
name: Production Pipeline

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
  
  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, battle-service, rating-service]
    
    steps:
      - uses: actions/checkout@v3
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - uses: docker/build-push-action@v4
        with:
          context: ./backend/services/${{ matrix.service }}
          push: true
          tags: |
            yourusername/${{ matrix.service }}:latest
            yourusername/${{ matrix.service }}:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/codearena
            docker-compose pull
            docker-compose up -d
            docker system prune -f
      
      - name: Health check
        run: |
          sleep 10
          curl -f https://codearena.com/health || exit 1
      
      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '❌' }} Deploy: ${{ github.sha }}"
            }
```

---

## Commands Cheat Sheet

```bash
# Create workflow directory
mkdir -p .github/workflows

# Test workflow locally (with act)
brew install act
act push

# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id>

# Cancel running workflow
gh run cancel <run-id>
```

---

## Next: Take 04_CICD_TEST.md then move to 05_TERRAFORM_GUIDE.md
