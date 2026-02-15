# 🚀 AWS Deployment Complete - Full Walkthrough & Learning Guide

**Date:** Feb 11, 2026  
**Your Live URL:** http://3.83.251.223  
**Monthly Cost:** ~$15 (t3.small instance)

---

## 🎯 What We Deployed

**CodeArena** - A complete competitive coding platform with:
- **Frontend:** React + Vite (port 8083)
- **5 Microservices:** Auth, Battle, Execution, Rating, WebSocket
- **Infrastructure:** PostgreSQL, Redis, RabbitMQ
- **Reverse Proxy:** Nginx
- **All containerized with Docker Compose**

---

## 📚 Part 1: Understanding AWS Components

### What is EC2?
**EC2 (Elastic Compute Cloud)** = Virtual server in the cloud
- Like renting a computer that runs 24/7 in Amazon's data center
- You get: CPU, RAM, storage, network
- We chose: **t3.small** (2 vCPU, 2GB RAM)

**Why t3.small?**
- Cheaper than t3.medium ($15 vs $30/month)
- Sufficient for CodeArena (microservices architecture is efficient)
- Can upgrade later if needed

### What is VPC?
**VPC (Virtual Private Cloud)** = Your private network in AWS
- Think of it as your own isolated network space
- Contains **subnets** (subdivisions of network)
- **Subnet** = Where your EC2 instances actually live

**Our Setup:**
- VPC: `vpc-0a6bfedd1c09ef8c5` (default VPC)
- Subnet: `subnet-009ac8d7875d544c8` (us-east-1a)

### What is Security Group?
**Security Group** = Firewall rules for your EC2
- Controls what traffic can reach your server
- Like a bouncer at a club - decides who gets in

**Our Rules:**
```
Port 22 (SSH):     Only YOUR IP (223.233.87.46)  → Secure remote access
Port 80 (HTTP):    0.0.0.0/0 (everyone)          → Public website
Port 443 (HTTPS):  0.0.0.0/0 (everyone)          → Public secure website
Port 3000-3004:    0.0.0.0/0 (everyone)          → API services
Port 8083:         0.0.0.0/0 (everyone)          → Frontend
```

**Security Note:** In production, you'd only expose ports 80/443 and route everything through Nginx. We opened service ports for testing.

---

## 📚 Part 2: Step-by-Step Deployment Walkthrough

### Step 1: Launch EC2 Instance

**Command:**
```bash
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \  # Ubuntu 22.04 LTS
  --instance-type t3.small \           # 2 vCPU, 2GB RAM
  --key-name codearena-prod-key \      # SSH key for access
  --security-group-ids sg-0fe11ec3cef74bc2c \  # Firewall rules
  --subnet-id subnet-009ac8d7875d544c8 \        # Where to place instance
  --associate-public-ip-address \               # Get public IP
  --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":20,\"VolumeType\":\"gp3\"}}]" \  # 20GB storage
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=codearena-production}]"  # Name tag
```

**What each part means:**
- `--image-id`: Which operating system (Ubuntu 22.04 - latest stable version)
- `--instance-type`: Size of virtual machine
- `--key-name`: SSH key for secure login (like a password file)
- `--security-group-ids`: Which firewall rules to use
- `--subnet-id`: Which part of network to use (**ERROR #1 FIX!**)
- `--associate-public-ip-address`: Give it a public IP so we can access from internet
- `--block-device-mappings`: Storage size (20GB to save money vs 30GB)
- `--tag-specifications`: Give it a name so we can find it easily

**Output:**
```
Instance ID: i-0cf8b02fe8d980d06
Public IP: 3.83.251.223
```

---

### ❌ ERROR #1: No Subnets in VPC

**What Happened:**
```
An error occurred (MissingInput) when calling the RunInstances operation: 
No subnets found for the default VPC 'vpc-0a6bfedd1c09ef8c5'. 
Please specify a subnet.
```

**Why?**
- EC2 instances MUST be placed in a subnet
- Like: You can't float in empty space, you need to be in a room (subnet) inside a house (VPC)
- Our VPC existed but had no subnet configured

**How to Find Subnets:**
```bash
aws ec2 describe-subnets --query 'Subnets[*].[SubnetId,AvailabilityZone,CidrBlock]'
```

**Output:**
```
subnet-009ac8d7875d544c8  us-east-1a  172.31.0.0/16
```

**Fix:**
Added `--subnet-id subnet-009ac8d7875d544c8` to the launch command.

**Learning:** Always specify subnet when launching EC2 instances!

---

### Step 2: Wait for Instance to Start

**Command:**
```bash
aws ec2 wait instance-running --instance-ids i-0cf8b02fe8d980d06
```

**What it does:**
- Polling AWS every few seconds: "Is it ready yet?"
- Returns when instance state changes from `pending` → `running`
- Takes ~30-60 seconds typically

**Why wait?**
- Can't SSH into instance until it's fully running
- Can't install software on a starting instance

---

### Step 3: Get Public IP

**Command:**
```bash
aws ec2 describe-instances \
  --instance-ids i-0cf8b02fe8d980d06 \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

**Output:**
```
3.83.251.223
```

**What is Public IP?**
- Address to access your server from internet
- Like your home address - anyone can send mail (traffic) to it
- Changes if you stop/start instance (unless you use Elastic IP)

---

### Step 4: SSH into EC2

**Command:**
```bash
ssh -i ~/.ssh/codearena-prod.pem ubuntu@3.83.251.223
```

**Breaking it down:**
- `ssh`: Secure Shell - encrypted remote terminal
- `-i ~/.ssh/codearena-prod.pem`: Use this private key file for authentication
- `ubuntu`: Username (default for Ubuntu AMI)
- `@3.83.251.223`: Server address

**First time:** You'll see "Are you sure you want to continue connecting?" - Type `yes`

This adds server to `~/.ssh/known_hosts` (list of trusted servers)

---

### Step 5: Install Docker

**Why Docker?**
- Packages application + all dependencies together
- Runs same way on any server (dev laptop, EC2, anywhere)
- Isolation - services don't conflict with each other

**Installation Script:**
```bash
#!/bin/bash
# Update packages
sudo apt update

# Install Docker (official script)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Allow ubuntu user to run docker without sudo
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**What each command does:**
1. `apt update`: Refresh package list (like "check for new apps")
2. Docker install script: Official automated installer from Docker
3. `usermod -aG docker ubuntu`: Add ubuntu user to docker group (permission to run docker commands)
4. Docker Compose install: Tool to manage multi-container apps
5. `chmod +x`: Make docker-compose executable

**Installed Versions:**
- Docker: 29.2.1
- Docker Compose: v5.0.2

**Time taken:** ~2 minutes

---

### Step 6: Transfer Code to EC2

**Method:** `rsync` (better than `scp` for large transfers)

**Command:**
```bash
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  -e "ssh -i ~/.ssh/codearena-prod.pem" \
  ./ ubuntu@3.83.251.223:~/codearena/
```

**Flags explained:**
- `-a`: Archive mode (preserves permissions, timestamps)
- `-v`: Verbose (show what's being copied)
- `-z`: Compress during transfer (faster over network)
- `--exclude`: Skip these folders/files
- `-e`: Use this SSH command

**Why exclude `node_modules`?**
- HUGE folder (100+ MB per service)
- Will be rebuilt fresh on server anyway
- Dramatically speeds up transfer

**Transfer stats:**
- Size: 1.8MB (after excluding node_modules)
- Time: ~10 seconds
- Speed: 71 KB/s

---

### Step 7: Create Production Environment Variables

**File:** `.env`

```bash
# Database
DATABASE_URL=postgresql://postgres:CodeArena2024!@postgres:5432/codebattle
POSTGRES_PASSWORD=CodeArena2024!

# JWT (authentication tokens)
JWT_SECRET=c9a85f4b2e3d8f6a1b7e9c4d3a6f8b2e5d9c7a1f3e8b6d4a9c2f7e1b5d8a3f6c
JWT_EXPIRES_IN=7d

# Redis (caching)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# RabbitMQ (message queue)
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# CORS (which domains can access API)
CORS_ORIGIN=http://3.83.251.223:8083

# Frontend API URLs
VITE_AUTH_API_URL=http://localhost:3001
VITE_BATTLE_API_URL=http://localhost:3002
VITE_EXECUTION_API_URL=http://localhost:3003
VITE_RATING_API_URL=http://localhost:3004
VITE_WS_URL=http://localhost:3000

# WebSocket client URL
CLIENT_URL=http://3.83.251.223:8083

# Environment
NODE_ENV=production
```

**Key Points:**
- **Never commit .env to git!** (contains secrets)
- `JWT_SECRET`: Random 64-char hex string (generated with `openssl rand -hex 32`)
- Database hostnames use Docker service names (`postgres`, `redis`) - Docker DNS resolves these
- Used EC2 public IP (3.83.251.223) where needed

**Security:** `.gitignore` updated to exclude `.env.production`

---

### Step 8: Build Docker Images

**Command:**
```bash
cd codearena
docker-compose build --no-cache
```

**What happens:**
1. Reads `docker-compose.yml`
2. Builds 6 images:
   - `codearena-auth-service`
   - `codearena-battle-service`
   - `codearena-execution-service`
   - `codearena-rating-service`
   - `codearena-websocket-server`
   - `codearena-frontend`

**Build process for each service:**
```dockerfile
# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci  # Clean install (faster, more reliable than npm install)
COPY . .
RUN npx prisma generate  # Generate Prisma client (database ORM)
RUN npm run build  # Compile TypeScript to JavaScript

# Runner stage (smaller image)
FROM node:20-alpine
RUN apk add --no-cache openssl  # Needed for Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

**Why multi-stage build?**
- Builder stage: Has all dev tools, large (~500MB)
- Runner stage: Only what's needed to run, small (~150MB)
- Final image doesn't include TypeScript, build tools, etc.

**Time taken:** ~8 minutes (all 6 services in parallel)

---

### Step 9: Start All Containers

**Command:**
```bash
docker-compose up -d
```

**`-d` flag:** Detached mode (runs in background)

**What Docker Compose does:**
1. Creates isolated network: `codearena_codearena-network`
2. Creates persistent volumes:
   - `postgres-data` (database storage)
   - `redis-data` (cache storage)
3. Starts containers in dependency order:
   - First: `postgres`, `redis`, `rabbitmq` (infrastructure)
   - Wait for health checks to pass
   - Then: `auth`, `battle`, `execution`, `rating`, `websocket` (services)
   - Finally: `frontend`

**Container Status:**
```
NAME                  STATUS         PORTS
codearena-postgres    Up (healthy)   5432/tcp
codearena-redis       Up (healthy)   6379/tcp
codearena-rabbitmq    Up (healthy)   5672/tcp, 15672/tcp
codearena-auth        Up             3001/tcp
codearena-battle      Up             3002/tcp
codearena-execution   Up             3003/tcp
codearena-rating      Up             3004/tcp
codearena-websocket   Up             3000/tcp
codearena-frontend    Up             8083/tcp
```

**All containers started successfully! Zero errors!** ✅

---

### Step 10: Install Nginx

**What is Nginx?**
- Web server + reverse proxy
- Sits in front of your application
- Routes incoming requests to correct service

**Why use Nginx?**
1. **Single entry point:** All traffic goes through port 80 (HTTP)
2. **Clean URLs:** `/api/auth/login` instead of `:3001/login`
3. **SSL termination:** Handle HTTPS in one place
4. **Load balancing:** Can distribute traffic across multiple servers
5. **Caching:** Store responses to speed up app
6. **Security:** Hide internal service ports

**Installation:**
```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Time taken:** ~30 seconds

---

### Step 11: Configure Nginx Reverse Proxy

**Config file:** `/etc/nginx/sites-available/codearena`

```nginx
server {
    listen 80;
    server_name _;

    # Frontend - everything goes here by default
    location / {
        proxy_pass http://localhost:8083;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket - real-time communication
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Auth Service API
    location /api/auth/ {
        proxy_pass http://localhost:3001/;
    }

    # Battle Service API
    location /api/battles/ {
        proxy_pass http://localhost:3002/;
    }

    # Execution Service API
    location /api/execute/ {
        proxy_pass http://localhost:3003/;
    }

    # Rating Service API
    location /api/rating/ {
        proxy_pass http://localhost:3004/;
    }
}
```

**How it works:**
1. Request comes to: `http://3.83.251.223/api/auth/login`
2. Nginx matches `/api/auth/` location block
3. Forwards to `http://localhost:3001/login` (removes `/api/auth` prefix)
4. Auth service responds
5. Nginx sends response back to user

**Enable and test:**
```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/codearena /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
# Output: syntax is ok, test is successful

# Apply changes
sudo systemctl reload nginx
```

---

## 📚 Part 3: How Everything Works Together

### Architecture Overview

```
Internet
    ↓
[Port 80] AWS Security Group
    ↓
[3.83.251.223] EC2 Instance (Ubuntu)
    ↓
[Nginx] Reverse Proxy
    ├─→ / → Frontend (port 8083)
    ├─→ /socket.io/ → WebSocket (port 3000)
    ├─→ /api/auth/ → Auth Service (port 3001)
    ├─→ /api/battles/ → Battle Service (port 3002)
    ├─→ /api/execute/ → Execution Service (port 3003)
    └─→ /api/rating/ → Rating Service (port 3004)
         ↓
    [Docker Network]
         ├─→ PostgreSQL (port 5432)
         ├─→ Redis (port 6379)
         └─→ RabbitMQ (port 5672)
```

### Request Flow Example

**User visits:** `http://3.83.251.223`

1. **Browser → AWS Security Group:** Check port 80 allowed? ✅
2. **Security Group → EC2:** Forward to instance
3. **EC2 → Nginx (port 80):** Receive request
4. **Nginx:** Match location `/` → proxy to `localhost:8083`
5. **Frontend Container:** Serve React app HTML
6. **Frontend → Browser:** Return HTML/CSS/JS
7. **Browser:** Render UI

**User clicks "Login":**

1. **Browser → Nginx:** `POST http://3.83.251.223/api/auth/login`
2. **Nginx:** Match `/api/auth/` → proxy to `localhost:3001/login`
3. **Auth Service:** Validate credentials
4. **Auth Service → PostgreSQL:** Query user database
5. **PostgreSQL → Auth Service:** Return user data
6. **Auth Service:** Generate JWT token  
7. **Auth Service → Nginx → Browser:** Return token
8. **Browser:** Store token, redirect to dashboard

---

## 📚 Part 4: Common Commands & Debugging

### SSH into Server
```bash
ssh -i ~/.ssh/codearena-prod.pem ubuntu@3.83.251.223
```

### Check Container Status
```bash
docker ps  # Running containers
docker ps -a  # All containers (including stopped)
```

### View Container Logs
```bash
docker logs codearena-auth  # View logs
docker logs -f codearena-auth  # Follow logs (live)
docker logs --tail 100 codearena-auth  # Last 100 lines
```

### Restart a Service
```bash
docker-compose restart auth-service
```

### Stop Everything
```bash
docker-compose down  # Stop and remove containers
docker-compose down -v  # Also remove volumes (deletes data!)
```

### Rebuild and Restart
```bash
docker-compose build --no-cache auth-service  # Rebuild specific service
docker-compose up -d auth-service  # Start it
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
sudo tail -f /var/log/nginx/access.log  # View requests
sudo tail -f /var/log/nginx/error.log  # View errors
```

### Database Access
```bash
docker exec -it codearena-postgres psql -U postgres -d codebattle
# Now you're in PostgreSQL shell
\dt  # List tables
\q  # Quit
```

### Check Disk Space
```bash
df -h  # Disk free
docker system df  # Docker disk usage
docker system prune -f  # Clean up unused images/containers
```

---

## 📚 Part 5: Cost Breakdown & Optimization

### Current Monthly Cost: ~$15

**EC2 t3.small:**
- $0.0208/hour × 730 hours = $15.18/month

**EBS Storage (20GB gp3):**
- $0.08/GB-month × 20 = $1.60/month

**Data Transfer:**
- First 100GB out: FREE
- After: $0.09/GB

**Total: ~$17/month**

### Cost Optimization Tips

1. **Stop when not using:**
   ```bash
   aws ec2 stop-instances --instance-ids i-0cf8b02fe8d980d06
   ```
   Only pay for storage ($1.60/month), not compute
   
2. **Use Reserved Instance (1-year commit):**
   Save 30-40% → ~$10/month instead of $15

3. **Downsize if possible:**
   - t3.micro (1GB RAM): $7.50/month
   - t3.nano (0.5GB RAM): $3.75/month

4. **Clean up regularly:**
   ```bash
   docker system prune -a  # Remove unused images
   ```

5. **Monitor usage:**
   ```bash
   aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=InstanceId,Value=i-0cf8b02fe8d980d06 --start-time 2026-02-10T00:00:00Z --end-time 2026-02-11T00:00:00Z --period 3600 --statistics Average
   ```

---

## 📚 Part 6: Security Best Practices

### ✅ What We Did Right

1. **SSH restricted to your IP only** (not open to world)
2. **Strong JWT secret** (random 64-char hex)
3. **Database password** (not default password)
4. **.env file excluded from git** (secrets not exposed)
5. **Docker isolation** (services can't interfere with each other)

### ⚠️ Production Improvements Needed

1. **SSL Certificate (HTTPS):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Close service ports in Security Group:**
   - Only keep ports 22, 80, 443 open
   - Services should only be accessible through Nginx

3. **Database backups:**
   ```bash
   # Daily backup script
   docker exec codearena-postgres pg_dump -U postgres codebattle > backup_$(date +%Y%m%d).sql
   
   # Upload to S3
   aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
   ```

4. **Monitoring:**
   - Set up CloudWatch alerts for CPU, memory, disk
   - Log aggregation (CloudWatch Logs or ELK stack)

5. **Auto-updates:**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

---

## 🎓 Learning Recap - What You Now Know

### AWS Concepts
✅ EC2 instances and instance types  
✅ VPCs and subnets  
✅ Security Groups (firewall rules)  
✅ SSH key pairs  
✅ Public IPs  
✅ AWS CLI commands  

### Docker Concepts
✅ Dockerfiles and multi-stage builds  
✅ Docker Compose for orchestration  
✅ Container networking  
✅ Persistent volumes  
✅ Health checks and service dependencies  

### Nginx Concepts
✅ Reverse proxy configuration  
✅ Location blocks and routing  
✅ WebSocket proxying  
✅ Virtual hosts  

### DevOps Skills
✅ Remote server management (SSH)  
✅ Environment variable management  
✅ Log debugging  
✅ Cost optimization  
✅ Security hardening  

---

## 🚀 Next Steps

1. **Test your application:**
   - Visit http://3.83.251.223
   - Try creating account, logging in
   - Test all features

2. **Monitor for a week:**
   - Check logs daily
   - Watch for errors
   - Monitor CPU/memory usage

3. **Set up a domain (optional):**
   - Buy domain on Namecheap/GoDaddy
   - Point A record to 3.83.251.223
   - Set up SSL with Let's Encrypt

4. **Take the brutal tests!**
   - `docs/02_AWS_TEST.md` - 850 points
   - `docs/03_NGINX_TEST.md` - 700 points

5. **Learn more:**
   - Add CI/CD (GitHub Actions)
   - Set up monitoring (Prometheus + Grafana)
   - Implement auto-scaling
   - Multi-region deployment

---

## 📞 Quick Reference

**Live URL:** http://3.83.251.223  
**SSH:** `ssh -i ~/.ssh/codearena-prod.pem ubuntu@3.83.251.223`  
**Instance ID:** i-0cf8b02fe8d980d06  
**Region:** us-east-1  
**Instance Type:** t3.small  
**Monthly Cost:** ~$15  

**Key Commands:**
```bash
# View containers
docker ps

# View logs
docker logs -f codearena-auth

# Restart service
docker-compose restart auth-service

# Stop instance (to save money)
aws ec2 stop-instances --instance-ids i-0cf8b02fe8d980d06

# Start instance
aws ec2 start-instances --instance-ids i-0cf8b02fe8d980d06
```

---

**Congratulations! You've deployed a production microservices application to AWS! 🎉**

Now go crush those brutal tests and become a DevOps master! 💪
