# Jenkins Mastery - Complete CI/CD with Pipeline as Code

**Goal:** Master Jenkins from zero to production pipelines

**What is Jenkins?**
- Open-source automation server
- Industry standard for CI/CD (70%+ companies use it)
- Self-hosted (you control everything)
- 1500+ plugins for any tool

---

## Part 1: Jenkins Fundamentals

### What is CI/CD?

**CI (Continuous Integration):**
- Developers push code → Automatically test
- Catch bugs early
- Merge conflicts detected immediately

**CD (Continuous Deployment):**
- Tests pass → Automatically deploy to production
- No manual steps
- Deploy 10x/day instead of 1x/month

**Jenkins Role:**
- Watches Git repo for changes
- Runs tests when code pushed
- Builds Docker images
- Deploys to servers
- Sends notifications

---

## Part 2: Jenkins Architecture

```
Developer → Git Push
    ↓
Jenkins Server (Master)
    ├─→ Builds Jobs
    ├─→ Runs Pipelines
    └─→ Manages Agents
         ↓
Jenkins Agents (Workers)
    ├─→ Run actual builds
    ├─→ Execute tests
    └─→ Deploy code
```

**Key Concepts:**

**Master (Controller):**
- Web UI
- Schedules jobs
- Monitors agents
- Stores configurations

**Agent (Node/Slave):**
- Executes actual work
- Can have different OS/tools
- Multiple agents = parallel builds

**Job:**
- Single task (build, test, deploy)
- Configured via UI

**Pipeline:**
- Multiple jobs chained together
- Defined in code (Jenkinsfile)
- Version controlled

---

## Part 3: Local Setup with Docker

### Install Jenkins in Docker (FREE - No AWS!)

```bash
# Create Docker network
docker network create jenkins

# Run Jenkins container
docker run -d \
  --name jenkins \
  --network jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**What each part means:**
- `-p 8080:8080`: Web UI port
- `-p 50000:50000`: Agent communication port
- `-v jenkins_home:/var/jenkins_home`: Persist data
- `-v /var/run/docker.sock`: Allow Jenkins to use Docker

### First-Time Setup

1. **Open browser:** http://localhost:8080
2. **Paste admin password** from above command
3. **Install suggested plugins** (click button, wait 5 min)
4. **Create admin user:**
   - Username: admin
   - Password: (your choice)
   - Full name: Your Name
   - Email: you@email.com
5. **Click "Save and Continue"** → **Start using Jenkins**

---

## Part 4: Jenkins UI Overview

### Main Dashboard

- **New Item:** Create jobs/pipelines
- **People:** Manage users
- **Build History:** All past builds
- **Manage Jenkins:** Settings, plugins, system config

### Job Types

1. **Freestyle Project:** GUI-based job (legacy)
2. **Pipeline:** Code-based job (modern, recommended)
3. **Multibranch Pipeline:** Pipeline for each Git branch
4. **Folder:** Organize jobs

---

## Part 5: Your First Jenkins Job (Freestyle)

**Step-by-step:**

1. Click **"New Item"**
2. Enter name: `test-job`
3. Select **"Freestyle project"**
4. Click **OK**

**Configure:**

**Source Code Management:**
- Select **Git**
- Repository URL: `https://github.com/yourusername/your-repo.git`
- Credentials: Add if private repo
- Branch: `*/main`

**Build Triggers:**
- ☑ **Poll SCM:** `H/5 * * * *` (check every 5 min)
  - Or **GitHub webhook** for instant triggers

**Build Steps:**
- Add build step → Execute shell
- Command:
  ```bash
  echo "Building..."
  npm install
  npm test
  ```

**Post-build Actions:**
- Add post-build action → Archive the artifacts
- Files to archive: `dist/**`

**Save** → **Build Now**

---

## Part 6: Pipeline as Code (Jenkinsfile)

**Why Pipelines?**
- Job defined in code (not UI clicks)
- Version controlled in Git
- Can review changes
- Reusable across projects

### Declarative Pipeline Syntax

**Jenkinsfile:**
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'npm test'
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying...'
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

**Breaking it down:**

- `pipeline {}`: Root block
- `agent any`: Run on any available agent
- `stages {}`: All stages
- `stage('name') {}`: Individual stage
- `steps {}`: Commands to run
- `post {}`: Actions after pipeline

---

## Part 7: Creating Pipeline Job

1. **New Item** → **Pipeline** → Name: `codearena-pipeline`
2. **Pipeline section:**
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: Your CodeArena repo
   - Script Path: `Jenkinsfile` (in repo root)
3. **Save**

**Create Jenkinsfile in repo:**
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_NAME = 'codearena'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/yourusername/codearena.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'docker-compose up -d'
                sh 'sleep 10'
                sh 'curl -f http://localhost:8083 || exit 1'
                sh 'docker-compose down'
            }
        }
        
        stage('Push Images') {
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {
                        sh 'docker-compose push'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'ssh ubuntu@your-server "cd codearena && docker-compose pull && docker-compose up -d"'
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose down || true'
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
```

---

## Part 8: Environment Variables & Credentials

### Built-in Variables

```groovy
pipeline {
    agent any
    stages {
        stage('Info') {
            steps {
                echo "Job: ${env.JOB_NAME}"
                echo "Build: ${env.BUILD_NUMBER}"
                echo "Workspace: ${env.WORKSPACE}"
                echo "Branch: ${env.GIT_BRANCH}"
            }
        }
    }
}
```

### Custom Environment Variables

```groovy
environment {
    NODE_ENV = 'production'
    API_URL = 'https://api.example.com'
}
```

### Credentials Management

**Add credentials in Jenkins:**
1. Manage Jenkins → Credentials
2. (global) → Add Credentials
3. Types:
   - **Username with password** (GitHub, DockerHub)
   - **Secret text** (API keys)
   - **SSH Username with private key** (Server access)
   - **Secret file** (.env file)

**Use in pipeline:**
```groovy
environment {
    DOCKERHUB = credentials('dockerhub-credentials')
}

steps {
    sh 'docker login -u $DOCKERHUB_USR -p $DOCKERHUB_PSW'
}
```

---

## Part 9: Docker Integration

### Method 1: Docker in Jenkins Container

```groovy
pipeline {
    agent {
        docker {
            image 'node:20-alpine'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
    }
}
```

**Benefits:**
- Clean environment every build
- Specific Node version
- No pollution between builds

### Method 2: Docker Compose

```groovy
stage('Integration Test') {
    steps {
        sh 'docker-compose -f docker-compose.test.yml up --abort-on-container-exit'
    }
}
```

### Method 3: Build and Push Images

```groovy
stage('Build Images') {
    steps {
        script {
            def services = ['auth-service', 'battle-service', 'rating-service']
            for (service in services) {
                sh "docker build -t myrepo/${service}:${BUILD_NUMBER} ./backend/services/${service}"
                sh "docker push myrepo/${service}:${BUILD_NUMBER}"
            }
        }
    }
}
```

---

## Part 10: Parallel Execution

**Run stages in parallel:**

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit Tests') {
            steps {
                sh 'npm run test:unit'
            }
        }
        stage('Integration Tests') {
            steps {
                sh 'npm run test:integration'
            }
        }
        stage('E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }
    }
}
```

**Parallel builds for multiple services:**

```groovy
stage('Build Services') {
    parallel {
        stage('Auth Service') {
            steps {
                dir('backend/services/auth-service') {
                    sh 'docker build -t auth:latest .'
                }
            }
        }
        stage('Battle Service') {
            steps {
                dir('backend/services/battle-service') {
                    sh 'docker build -t battle:latest .'
                }
            }
        }
    }
}
```

---

## Part 11: Advanced Pipeline Features

### Input Step (Manual Approval)

```groovy
stage('Deploy to Production') {
    steps {
        input message: 'Deploy to production?', 
              ok: 'Deploy',
              submitter: 'admin,devops-team'
        
        sh './deploy-production.sh'
    }
}
```

### When Conditions

```groovy
stage('Deploy to Staging') {
    when {
        branch 'develop'
    }
    steps {
        sh './deploy-staging.sh'
    }
}

stage('Deploy to Production') {
    when {
        branch 'main'
        environment name: 'DEPLOY_ENV', value: 'production'
    }
    steps {
        sh './deploy-production.sh'
    }
}
```

### Retry Logic

```groovy
stage('Deploy') {
    steps {
        retry(3) {
            sh './deploy.sh'
        }
    }
}
```

### Timeout

```groovy
stage('Long Running Task') {
    steps {
        timeout(time: 30, unit: 'MINUTES') {
            sh './long-task.sh'
        }
    }
}
```

### Try-Catch

```groovy
stage('Risky Operation') {
    steps {
        script {
            try {
                sh './risky-script.sh'
            } catch (Exception e) {
                echo "Failed: ${e.getMessage()}"
                currentBuild.result = 'UNSTABLE'
            }
        }
    }
}
```

---

## Part 12: Multibranch Pipeline

**Automatically create pipeline for each Git branch:**

1. **New Item** → **Multibranch Pipeline**
2. **Branch Sources:**
   - Add source → Git
   - Project Repository: Your repo URL
   - Credentials: If private
   - Behaviors: Discover branches
3. **Build Configuration:**
   - Mode: by Jenkinsfile
   - Script Path: `Jenkinsfile`
4. **Scan Multibranch Pipeline Triggers:**
   - Periodically if not otherwise run: 5 minutes

**How it works:**
- Scans repo for branches
- Each branch with Jenkinsfile gets own pipeline
- Create feature branch → Auto-creates pipeline
- Merge branch → Auto-deletes pipeline

---

## Part 13: Webhooks (Instant Triggers)

### GitHub Webhook Setup

**In Jenkins:**
1. Install **GitHub Integration Plugin**
2. Job → Configure → Build Triggers
3. ☑ **GitHub hook trigger for GITScm polling**

**In GitHub:**
1. Repo → Settings → Webhooks → Add webhook
2. Payload URL: `http://your-jenkins:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. Active: ☑
6. Add webhook

**Now:** Every git push triggers Jenkins build automatically!

---

## Part 14: Notifications

### Email Notifications

**Configure in Manage Jenkins:**
1. Manage Jenkins → Configure System
2. **E-mail Notification:**
   - SMTP server: `smtp.gmail.com`
   - Use SSL: ☑
   - Port: 465
   - Credentials: Add Gmail credentials

**In Jenkinsfile:**
```groovy
post {
    failure {
        emailext(
            subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Check console output at ${env.BUILD_URL}",
            to: 'team@company.com'
        )
    }
}
```

### Slack Notifications

**Install Slack Notification Plugin:**

```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "Build succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
}
```

---

## Part 15: Jenkins Agents (Distributed Builds)

### Why Agents?

- **Master overwhelmed:** Too many builds
- **Different OS needed:** Build on Linux, test on Windows
- **Parallel execution:** 10 builds simultaneously
- **Resource isolation:** Heavy builds don't slow down Jenkins UI

### Add SSH Agent

1. **Manage Jenkins** → **Nodes** → **New Node**
2. Node name: `linux-agent-1`
3. Permanent Agent
4. **Configuration:**
   - Remote root directory: `/home/jenkins`
   - Labels: `linux docker`
   - Launch method: **Launch agents via SSH**
   - Host: Agent server IP
   - Credentials: SSH key

**Use specific agent:**
```groovy
pipeline {
    agent {
        label 'linux docker'
    }
    // or
    agent {
        label 'windows'
    }
}
```

---

## Part 16: Blue Ocean UI

**Modern, visual pipeline UI:**

1. **Install Blue Ocean Plugin**
2. Click **Blue Ocean** in sidebar
3. Visual pipeline editor
4. Better logs display
5. Pipeline activity view

**Features:**
- Visual pipeline builder (no code)
- Beautiful visualization
- Easier debugging
- Better for presentations

---

## Part 17: Complete CodeArena Pipeline

**Jenkinsfile for CodeArena:**

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        REGISTRY_CREDENTIAL = 'dockerhub-credentials'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Auth Service') {
                    steps {
                        dir('backend/services/auth-service') {
                            sh "docker build -t ${DOCKER_REGISTRY}/codearena-auth:${IMAGE_TAG} ."
                        }
                    }
                }
                stage('Battle Service') {
                    steps {
                        dir('backend/services/battle-service') {
                            sh "docker build -t ${DOCKER_REGISTRY}/codearena-battle:${IMAGE_TAG} ."
                        }
                    }
                }
                stage('Execution Service') {
                    steps {
                        dir('backend/services/execution-service') {
                            sh "docker build -t ${DOCKER_REGISTRY}/codearena-execution:${IMAGE_TAG} ."
                        }
                    }
                }
                stage('Rating Service') {
                    steps {
                        dir('backend/services/rating-service') {
                            sh "docker build -t ${DOCKER_REGISTRY}/codearena-rating:${IMAGE_TAG} ."
                        }
                    }
                }
                stage('WebSocket Server') {
                    steps {
                        dir('backend/services/websocket-server') {
                            sh "docker build -t ${DOCKER_REGISTRY}/codearena-websocket:${IMAGE_TAG} ."
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        sh "docker build -f Dockerfile.frontend -t ${DOCKER_REGISTRY}/codearena-frontend:${IMAGE_TAG} ."
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                sh 'docker-compose -f docker-compose.test.yml up --abort-on-container-exit'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'docker scan codearena-auth:${IMAGE_TAG} || true'
            }
        }
        
        stage('Push Images') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDENTIAL) {
                        sh "docker push ${DOCKER_REGISTRY}/codearena-auth:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/codearena-battle:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/codearena-execution:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/codearena-rating:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/codearena-websocket:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/codearena-frontend:${IMAGE_TAG}"
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh """
                    ssh ubuntu@staging-server '
                        cd /opt/codearena && \\
                        docker-compose pull && \\
                        docker-compose up -d
                    '
                """
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                
                sh """
                    ssh ubuntu@production-server '
                        cd /opt/codearena && \\
                        docker-compose pull && \\
                        docker-compose up -d
                    '
                """
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose -f docker-compose.test.yml down || true'
            cleanWs()
        }
        success {
            slackSend color: 'good', message: "Build #${BUILD_NUMBER} succeeded!"
        }
        failure {
            slackSend color: 'danger', message: "Build #${BUILD_NUMBER} failed!"
        }
    }
}
```

---

## Part 18: Jenkins Best Practices

### 1. Always Use Pipeline as Code
❌ **Bad:** GUI-configured freestyle jobs
✅ **Good:** Jenkinsfile in Git

### 2. Use Shared Libraries
**Reuse pipeline code:**

```groovy
// vars/buildDockerImage.groovy
def call(String imageName) {
    sh "docker build -t ${imageName} ."
}

// Jenkinsfile
@Library('my-shared-library') _
buildDockerImage('myapp:latest')
```

### 3. Don't Store Secrets in Code
❌ **Bad:** `password = 'secret123'`
✅ **Good:** `credentials('my-secret-id')`

### 4. Clean Up Workspace
```groovy
post {
    always {
        cleanWs()
    }
}
```

### 5. Use Docker for Clean Builds
```groovy
agent {
    docker {
        image 'node:20-alpine'
    }
}
```

### 6. Set Build Timeouts
```groovy
options {
    timeout(time: 1, unit: 'HOURS')
}
```

### 7. Archive Important Artifacts
```groovy
post {
    always {
        archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
        junit 'test-results/*.xml'
    }
}
```

---

## Part 19: Troubleshooting

### Build Stuck/Hanging
```bash
# Check Jenkins logs
docker logs jenkins

# Restart Jenkins
docker restart jenkins
```

### "No space left on device"
```bash
# Clean up Docker
docker system prune -a

# Clean Jenkins workspace
# In Jenkins: Job → Workspace → Wipe Out Workspace
```

### Plugin Conflicts
1. Manage Jenkins → Plugin Manager
2. Check "Available" tab for updates
3. Update all plugins
4. Restart Jenkins

### Permission Denied (Docker Socket)
```bash
# Give Jenkins container Docker access
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

---

## Part 20: Commands Cheat Sheet

```bash
# Start Jenkins
docker run -d --name jenkins -p 8080:8080 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts

# Get admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# View logs
docker logs -f jenkins

# Restart Jenkins
docker restart jenkins

# Backup Jenkins
docker exec jenkins tar czf /tmp/jenkins-backup.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/jenkins-backup.tar.gz ./

# Restore Jenkins
docker cp jenkins-backup.tar.gz jenkins:/tmp/
docker exec jenkins tar xzf /tmp/jenkins-backup.tar.gz -C /

# Execute command in Jenkins
docker exec jenkins <command>
```

---

## Summary: Jenkins vs GitHub Actions

| Feature | Jenkins | GitHub Actions |
|---------|---------|----------------|
| **Hosting** | Self-hosted | Cloud (GitHub) |
| **Cost** | Free (you pay server) | 2000 min/month free |
| **Setup** | Complex | Easy |
| **Control** | Full control | Limited |
| **Plugins** | 1500+ | Growing |
| **UI** | Powerful | Simple |
| **Learning Curve** | Steep | Gentle |
| **Enterprise Use** | Standard | Growing |
| **Best For** | Large orgs, complex pipelines | Small teams, simple CI/CD |

---

**Next:** Take `04_JENKINS_TEST.md` - 850 brutal points covering everything!
