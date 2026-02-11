# AWS Fundamentals - From Zero to Deployment Ready

**Goal:** Deploy CodeArena to AWS EC2 and understand every single thing you're doing.

**Prerequisite:** Docker knowledge (which you have ✅)

---

## Part 1: Core Concepts - The Mental Model

### What is Cloud Computing?

**Without cloud:** You buy servers, install them in your office, manage power, cooling, security, networking. Server died? You're screwed until you buy a new one.

**With cloud:** Rent servers by the hour. Need more? Click button. Server died? AWS replaces it automatically.

**AWS = Amazon Web Services** - The biggest cloud provider (32% of market)

---

### The AWS Services You MUST Know

**For this project, you need:**

1. **EC2 (Elastic Compute Cloud)**
   - Virtual servers in the cloud
   - Like Docker, but for entire machines
   - You'll run your Docker containers here

2. **VPC (Virtual Private Cloud)**
   - Your private network in AWS
   - Like your home WiFi, but in Amazon's datacenter
   - Controls which services can talk to each other

3. **Security Groups**
   - Firewall rules
   - "Only allow HTTP traffic from internet"
   - "Only allow SSH from my IP"

4. **IAM (Identity & Access Management)**
   - Who can do what in your AWS account
   - Like user permissions on Linux

5. **Route 53**
   - DNS service
   - Points `codearena.com` to your EC2 IP

---

## Part 2: AWS Account Setup

### Step 1: Create AWS Account

```bash
# Go to aws.amazon.com
# Click "Create AWS Account"
# You'll need:
# - Email
# - Credit card (they charge $1 to verify, refund it)
# - Phone number (for 2FA)
```

**CRITICAL:** Enable MFA (Multi-Factor Auth) IMMEDIATELY
- Go to IAM → Your Security Credentials
- Enable MFA with your phone
- Why? Account hijacking is real

---

### Step 2: Understand AWS Regions & Availability Zones

**Region:** Physical location (e.g., `us-east-1` = Virginia)
**Availability Zone (AZ):** Data center within region (e.g., `us-east-1a`)

```
Region: us-east-1 (N. Virginia)
├── us-east-1a (Data center 1)
├── us-east-1b (Data center 2)
└── us-east-1c (Data center 3)
```

**Why multiple AZs?**
- If one data center loses power, others keep running
- You deploy across AZs for high availability

**For CodeArena:** Start with single AZ (cheaper), later expand

---

### Step 3: Install AWS CLI

```bash
# Download AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
# Should show: aws-cli/2.x.x Python/3.x.x Linux/x.x.x
```

**Configure AWS CLI:**
```bash
aws configure

# It will ask:
# AWS Access Key ID: [Your key from IAM]
# AWS Secret Access Key: [Your secret]
# Default region: us-east-1
# Default output format: json
```

**How to get Access Keys:**
1. Go to IAM console
2. Users → Your username
3. Security Credentials tab
4. Create Access Key → CLI
5. DOWNLOAD THE CSV! You can't see the secret again

**Security WARNING:**
- NEVER commit access keys to git
- NEVER share them
- Rotate them every 90 days

---

## Part 3: EC2 Deep Dive

### What is EC2?

Virtual servers you can rent by the hour.

**Think of it like:**
- You install Ubuntu on a virtual machine
- That VM runs in Amazon's datacenter
- You SSH into it like any Linux server

---

### EC2 Instance Types

Format: `t3.medium`
- **t3** = instance family (T = burstable, optimized for variable workloads)
- **medium** = size (CPU/RAM)

**Common types:**

| Type | vCPUs | RAM | Use Case | Cost/month |
|------|-------|-----|----------|------------|
| t3.micro | 2 | 1 GB | Testing | ~$7 |
| t3.small | 2 | 2 GB | Small apps  | ~$15 |
| t3.medium | 2 | 4 GB | **CodeArena** | ~$30 |
| t3.large | 2 | 8 GB | Higher load | ~$60 |

**For CodeArena:** `t3.medium` is perfect
- 2 vCPUs for Docker containers
- 4 GB RAM for Postgres + Redis + services

---

### AMI (Amazon Machine Image)

Pre-configured OS image. Like a Docker image, but for entire OS.

**Popular AMIs:**
- **Amazon Linux 2023** - AWS's optimized Linux
- **Ubuntu 22.04 LTS** - Most popular
- **Debian** - Lightweight

**For CodeArena:** Use **Ubuntu 22.04 LTS**
- Familiar (you used it locally)
- Great Docker support
- Long-term support (LTS)

---

### EC2 Pricing Models

1. **On-Demand**
   - Pay by the hour
   - No commitment
   - Most expensive
   - **Use for:** Production (you always need it running)

2. **Reserved Instances**
   - Commit to 1-3 years
   - 30-70% cheaper
   - **Use for:** Stable workloads

3 **Spot Instances**
   - Bid on unused capacity
   - Up to 90% cheaper
   - Can be terminated anytime
   - **Use for:** Batch jobs, not production

**For CodeArena:** Start with On-Demand, later switch to Reserved

---

### EBS (Elastic Block Store)

**Hard drives for EC2.**

When you launch EC2, it gets a root volume (default 8GB).

**Volume Types:**

| Type | Use Case | IOPS | Cost |
|------|----------|------|------|
| gp3 | General purpose | 3,000-16,000 | $$$ |
| gp2 | Legacy general purpose | Scales with size | $$ |
| io2 | High performance DB | 64,000+ | $$$$ |

**For CodeArena:**
- Root volume: **gp3, 30 GB** (OS + Docker images)
- Database volume: **gp3, 20 GB** (if you separate Postgres data)

---

## Part 4: VPC & Networking

### What is a VPC?

Your own private network in AWS. Like building your own internet inside AWS.

**Default VPC:**
- Every AWS account has a default VPC
- Usually in `172.31.0.0/16` range
- Has internet gateway already configured

**For learning:** Use default VPC first, create custom later

---

### Subnets

Subdivisions of your VPC.

```
VPC: 10.0.0.0/16 (65,536 IPs)
├── Public Subnet: 10.0.1.0/24 (EC2 with public IPs)
└── Private Subnet: 10.0.2.0/24 (Databases, no internet access)
```

**Public vs Private:**
- **Public subnet:** Has internet access (via Internet Gateway)
- **Private subnet:** No direct internet (more secure for DBs)

**For CodeArena initially:**
- Everything in public subnet (simple)
- Later: Move DB to private subnet

---

### Security Groups

**Firewall rules for EC2 instances.**

Think of it like:
```bash
# Block all traffic by default
# Then whitelist specific ports
```

**Example Security Group for CodeArena:**

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP | Login to server |
| HTTP | 80 | 0.0.0.0/0 | Website traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure traffic |
| Custom | 3000-3004 | 0.0.0.0/0 | Services (dev only!) |
| PostgreSQL | 5432 | SG itself | Internal DB access |

**CRITICAL Security Rules:**
1. **NEVER** open SSH (22) to `0.0.0.0/0` (entire internet)
2. **ALWAYS** restrict SSH to your IP
3. Close dev ports (3000-3004) in production

---

### Elastic IP

Normally, EC2 gets a random public IP. If you stop/start, IP changes.

**Elastic IP = Static public IP**

```bash
# Allocate Elastic IP
aws ec2 allocate-address --region us-east-1

# Associate with instance
aws ec2 associate-address \
  --instance-id i-1234567890abcdef0 \
  --allocation-id eipalloc-12345678
```

**Costs:**
- Free if attached to running instance
- $0.005/hour if NOT attached (prevents hoarding)

---

## Part 5: IAM - Access Control

### IAM Users vs Roles

**User:** Person or service with credentials (email + password or access keys)
**Role:** Temporary credentials for AWS services

**Example:**
- **User:** You (logs into console)
- **Role:** EC2 instance (accesses S3 without storing keys)

---

### IAM Policies

JSON documents that define permissions.

**Example Policy - Allow EC2 read-only:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:Get*"
      ],
      "Resource": "*"
    }
  ]
}
```

**Policies attach to:**
- Users
- Groups
- Roles

---

### Principle of Least Privilege

**Give minimum permissions needed, nothing more.**

Bad:
```json
{ "Effect": "Allow", "Action": "*", "Resource": "*" }
```

Good:
```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::my-bucket/*"
}
```

---

## Part 6: Launching Your First EC2 Instance

### Method 1: AWS Console (GUI)

1. Go to EC2 Dashboard
2. Click "Launch Instance"
3. Configure:

**Name:** `codearena-server`

**AMI:** Ubuntu 22.04 LTS

**Instance Type:** `t3.medium`

**Key Pair:**
- Create new key pair
- Name: `codearena-key`
- Type: RSA
- Format: .pem
- **DOWNLOAD and save to `~/.ssh/codearena-key.pem`**

**Network:**
- VPC: default
- Subnet: No preference
- Auto-assign public IP: Enable

**Security Group:**
- Create new
- Allow: SSH (22) from My IP
- Allow: HTTP (80) from Anywhere
- Allow: HTTPS (443) from Anywhere

**Storage:**
- 30 GB gp3

4. Launch!

---

### Method 2: AWS CLI (Recommended)

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name codearena-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/codearena-key.pem

# Set permissions
chmod 400 ~/.ssh/codearena-key.pem

# Create security group
aws ec2 create-security-group \
  --group-name codearena-sg \
  --description "CodeArena security group"

# Add SSH rule (replace YOUR_IP)
aws ec2 authorize-security-group-ingress \
  --group-name codearena-sg \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Add HTTP
aws ec2 authorize-security-group-ingress \
  --group-name codearena-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Add HTTPS
aws ec2 authorize-security-group-ingress \
  --group-name codearena-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Launch instance (get AMI ID from AWS console first)
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --instance-type t3.medium \
  --key-name codearena-key \
  --security-groups codearena-sg \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":30}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=codearena-server}]'
```

---

### Connecting to EC2

```bash
# Get public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=codearena-server" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text

# SSH
ssh -i ~/.ssh/codearena-key.pem ubuntu@<PUBLIC_IP>

# If permission denied:
chmod 400 ~/.ssh/codearena-key.pem
```

---

## Part 7: Setting Up EC2 for Docker

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (avoid sudo)
sudo usermod -aG docker ubuntu

# Logout and login again
exit
ssh -i ~/.ssh/codearena-key.pem ubuntu@<PUBLIC_IP>

# Verify
docker --version
```

### Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### Transfer CodeArena Code

**Option 1: Git Clone (Recommended)**
```bash
# On EC2
git clone https://github.com/YOUR_USERNAME/code-arena.git
cd code-arena
```

**Option 2: SCP (if code not on GitHub)**
```bash
# From your local machine
scp -i ~/.ssh/codearena-key.pem -r /path/to/codearena ubuntu@<PUBLIC_IP>:/home/ubuntu/
```

---

## Part 8: Environment Variables & Secrets

### Create .env on EC2

```bash
# SSH to EC2
ssh -i ~/.ssh/codearena-key.pem ubuntu@<PUBLIC_IP>

# Create .env
cd codearena
nano .env
```

**Contents:**
```bash
# Database
POSTGRES_PASSWORD=super_secure_random_password_123

# JWT
JWT_SECRET=another_random_secret_456

# Environment
NODE_ENV=production
```

**Generate random secrets:**
```bash
# On EC2
openssl rand -base64 32
```

### Secure .env

```bash
# Only owner can read
chmod 600 .env

# Verify it's in .gitignore
cat .gitignore | grep .env
```

---

## Part 9: Running CodeArena on EC2

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify all running
docker-compose ps
```

### Test Locally on EC2

```bash
# From EC2 terminal
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Test from Internet

```bash
# From your local machine
curl http://<EC2_PUBLIC_IP>:3001/health
```

**If this fails:**
- Check Security Group allows port 3001
- Or set up Nginx reverse proxy (next phase)

---

## Part 10: AWS Cost Management

### Enable Billing Alerts

1. Go to AWS Billing Dashboard
2. Billing Preferences
3. Enable "Receive Billing Alerts"
4. Set up CloudWatch alarm for $10, $50, $100

### Cost Breakdown (Monthly)

| Service | Cost |
|---------|------|
| t3.medium EC2 | ~$30 |
| 30 GB EBS | ~$2.40 |
| Data transfer (first 1GB free) | $0-5 |
| Elastic IP (if used) | $0 |
| **Total** | **~$35-40/month** |

### Save Money

1. **Stop (don't terminate) when not using:**
   ```bash
   aws ec2 stop-instances --instance-ids i-1234567890abcdef0
   ```
   - Stops billing for EC2
   - Still pay for EBS (~$2.40)
   - Restart when needed

2. **Use AWS Free Tier:**
   - t2.micro is free for first 12 months
   - Use for learning, upgrade to t3.medium for production

3. **Delete snapshots:**
   - EBS snapshots cost money
   - Delete old ones

---

## Part 11: Common AWS Errors & Fixes

### Error: "Connection refused" when SSH

**Cause:** Security Group doesn't allow SSH from your IP

**Fix:**
```bash
# Check your current IP
curl ifconfig.me

# Update security group
aws ec2 authorize-security-group-ingress \
  --group-name codearena-sg \
  --protocol tcp \
  --port 22 \
  --cidr <YOUR_IP>/32
```

---

### Error: "Permission denied (publickey)"

**Cause:** Wrong key file or wrong user

**Fix:**
```bash
# Ensure using correct key
ssh -i ~/.ssh/codearena-key.pem ubuntu@<IP>

# Ensure key permissions
chmod 400 ~/.ssh/codearena-key.pem

# For Amazon Linux, user is ec2-user not ubuntu
ssh -i ~/.ssh/codearena-key.pem ec2-user@<IP>
```

---

### Error: Instance keeps stopping/terminating

**Cause:** Out of credits (if using free tier) or billing issue

**Fix:**
- Check Billing Dashboard
- Add payment method
- Check instance limits in Service Quotas

---

### Error: "Insufficient capacity"

**Cause:** AWS ran out of t3.medium instances in that AZ

**Fix:**
```bash
# Try different AZ
aws ec2 run-instances \
  ... \
  --placement AvailabilityZone=us-east-1b
```

---

## Part 12: AWS CLI Cheat Sheet

### EC2 Commands

```bash
# List all instances
aws ec2 describe-instances

# List running instances
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"

# Start instance
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Stop instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Terminate instance (DELETE - careful!)
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# Get public IP
aws ec2 describe-instances \
  --instance-ids i-1234567890abcdef0 \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text

# Create snapshot (backup)
aws ec2 create-snapshot --volume-id vol-1234567890abcdef0

# List snapshots
aws ec2 describe-snapshots --owner-ids self
```

### Security Group Commands

```bash
# List security groups
aws ec2 describe-security-groups

# Describe specific group
aws ec2 describe-security-groups --group-names codearena-sg

# Add rule
aws ec2 authorize-security-group-ingress \
  --group-name codearena-sg \
  --protocol tcp \
  --port 8083 \
  --cidr 0.0.0.0/0

# Remove rule
aws ec2 revoke-security-group-ingress \
  --group-name codearena-sg \
  --protocol tcp \
  --port 8083 \
  --cidr 0.0.0.0/0
```

---

## Part 13: Production Checklist

Before going live:

- [ ] SSH restricted to your IP only
- [ ] All secrets in .env (not hardcoded)
- [ ] .env has chmod 600
- [ ] Billing alerts configured
- [ ] Backups scheduled (EBS snapshots)
- [ ] Monitoring enabled (CloudWatch)
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Domain pointed to Elastic IP
- [ ] Database on separate volume
- [ ] Application logs configured
- [ ] Firewall (UFW) enabled
- [ ] Auto-updates configured

---

## Next Steps

You now understand AWS fundamentals. Next:

1. Take the **02_AWS_TEST.md** (brutal testing awaits)
2. Move to **03_NGINX_GUIDE.md** (reverse proxy + SSL)
3. Set up proper domain and HTTPS

---

## Key Takeaways

1. **EC2 = Virtual servers you rent**
2. **VPC = Your private network**
3. **Security Groups = Firewall rules**
4. **IAM = Access management**
5. **Always use least privilege**
6. **Monitor your costs**
7. **Secure your SSH keys**

You're now AWS-ready. Let's test this knowledge. 😈
