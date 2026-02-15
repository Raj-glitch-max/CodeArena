# AWS Brutal Test - Prove Your Mastery

**Instructions:**
- NO GOOGLING answers, only commands/syntax
- NO solutions provided - figure it out
- Each level builds on previous
- Document your approach for each question
- If stuck > 30 min, note it and move on

**Scoring:**
- Level 1: 20 questions × 5 points = 100 points
- Level 2: 15 questions × 10 points = 150 points
- Level 3: 10 questions × 15 points = 150 points
- Level 4: 8 questions × 25 points = 200 points
- Level 5: 5 questions × 50 points = 250 points
- **Total: 850 points**

**Pass:** 600+ points (70%)
**Master:** 750+ points (88%)
**Legend:** 800+ points (94%)

---

## Level 1: Fundamentals (100 points)

### 1.1 What is the difference between stopping and terminating an EC2 instance? (5 pts)

**Your answer:**
- Stopping:
- Terminating:
- Cost implications:

---

### 1.2 You have 5 t3.medium instances running 24/7. Calculate monthly cost. (5 pts)

**Given:** t3.medium = $0.0416/hour

**Your calculation:**

---

### 1.3 What is an AMI and why would you create a custom one? (5 pts)

**Your answer:**

---

### 1.4 Explain Security Groups vs NACLs (Network ACLs). (5 pts)

**Your answer:**
- Security Groups:
- NACLs:
- Key differences:

---

### 1.5 What does 10.0.1.0/24 mean in CIDR notation? (5 pts)

**Your answer:**
- Network range:
- Number of usable IPs:
- Subnet mask:

---

### 1.6 Your EC2 public IP changed after restart. What happened and how to fix? (5 pts)

**Your answer:**
- What happened:
- How to prevent:

---

### 1.7 Write AWS CLI command to list all running EC2 instances in us-east-1. (5 pts)

**Your command:**
```bash

```

---

### 1.8 What is the difference between IAM User and IAM Role? (5 pts)

**Your answer:**

---

### 1.9 You need to allow only your office IP (203.0.113.5) to SSH. Write the security group rule. (5 pts)

**Your rule (CLI or console format):**
```bash

```

---

### 1.10 What is an Availability Zone and why use multiple AZs? (5 pts)

**Your answer:**

---

### 1.11 You see this error: "Permission denied (publickey)". List 3 possible causes. (5 pts)

**Your answers:**
1.
2.
3.

---

### 1.12 What's the difference between t3.medium and c5.medium? Which for what? (5 pts)

**Your answer:**

---

### 1.13 Write command to SSH into EC2 with key file `mykey.pem` and IP `1.2.3.4`. (5 pts)

**Your command:**
```bash

```

---

### 1.14 What is EBS and what happens to it when you terminate EC2? (5 pts)

**Your answer:**

---

### 1.15 Explain the difference between public and private subnet. (5 pts)

**Your answer:**

---

### 1.16 You want to run a scheduled task daily at 2 AM on EC2. What's the best approach? (5 pts)

**Your answer:**

---

### 1.17 What is the default VPC and should you use it in production? (5 pts)

**Your answer:**

---

### 1.18 Write IAM policy to allow read-only access to all S3 buckets. (5 pts)

**Your policy (JSON):**
```json

```

---

### 1.19 Your instance has high CPU. How to check and identify the process? (5 pts)

**Your commands:**
```bash

```

---

### 1.20 What is User Data in EC2 and give example use case. (5 pts)

**Your answer:**

**Example:**
```bash

```

---

## Level 2: Hands-On Building (150 points)

### 2.1 Launch EC2 with specific requirements (10 pts)

**Task:** Using AWS CLI, launch an EC2 instance with:
- Ubuntu 22.04 LTS
- t3.small
- 20 GB gp3 storage
- Tag: Environment=Testing
- Enable detailed monitoring

**Your command:**
```bash

```

---

### 2.2 Create a security group from scratch (10 pts)

**Task:** Create security group for a web server that:
- Allows HTTP from anywhere
- Allows HTTPS from anywhere
- Allows SSH only from 203.0.113.0/24
- Blocks all other traffic

**Your AWS CLI commands:**
```bash

```

---

### 2.3 Set up automated backups (10 pts)

**Task:** Create a bash script that:
- Creates EBS snapshot of volume vol-12345678
- Tags snapshot with current date
- Deletes snapshots older than 7 days

**Your script:**
```bash

```

---

### 2.4 Cost optimization challenge (10 pts)

**Scenario:** You have:
- 3 t3.large instances (24/7)
- 2 t3.medium instances (only 9 AM - 6 PM weekdays)
- 500 GB EBS storage

**Calculate current monthly cost and propose 30% reduction strategy.**

**Your answer:**
- Current cost:
- Optimized approach:
- New cost:

---

### 2.5 Multi-AZ deployment (10 pts)

**Task:** You need to deploy CodeArena with high availability.

**Design:**
- Draw (or describe) architecture with 2 AZs
- Explain how traffic routes
- What happens if one AZ fails?

**Your design:**

---

### 2.6 SSH key rotation (10 pts)

**Task:** Write step-by-step process to rotate SSH keys on running EC2 without downtime.

**Your steps:**
1.
2.
3.
...

---

### 2.7 Monitor and alert (10 pts)

**Task:** Set up CloudWatch alarm that:
- Monitors CPU > 80%
- For 5 minutes
- Sends email to you

**Your AWS CLI commands:**
```bash

```

---

### 2.8 Instance metadata service (10 pts)

**Task:** From inside EC2, write commands to get:
- Instance ID
- Public IP
- Availability Zone
- IAM role name

**Your commands:**
```bash

```

---

### 2.9 Elastic IP automation (10 pts)

**Task:** Write script that:
- Checks if instance has Elastic IP
- If not, allocates and associates one
- Logs the IP to a file

**Your script:**
```bash

```

---

### 2.10 Create custom AMI (10 pts)

**Scenario:** You configured an instance with Docker, Docker Compose, and your app. You want to create reusable AMI.

**Your steps (CLI commands):**
```bash

```

---

### 2.11 VPC from scratch (10 pts)

**Task:** Create VPC with:
- CIDR: 10.0.0.0/16
- 2 public subnets (10.0.1.0/24, 10.0.2.0/24)
- 2 private subnets (10.0.3.0/24, 10.0.4.0/24)
- Internet Gateway
- NAT Gateway in one public subnet

**Your CLI commands:**
```bash

```

---

### 2.12 Data transfer to EC2 (10 pts)

**Task:** You have 5 GB codebase locally. Compare 3 methods to transfer to EC2:

**Methods:**
1. SCP
2. Git clone
3. S3 + AWS CLI

**Compare:** Speed, cost, complexity

**Your answer:**

---

### 2.13 IAM role for EC2 (10 pts)

**Task:** Create IAM role that allows EC2 to:
- Read from S3 bucket `app-configs`
- Write logs to CloudWatch
- Attach to instance

**Your commands:**
```bash

```

---

### 2.14 Troubleshoot connection (10 pts)

**Scenario:** You can't SSH to EC2. Security group allows SSH from your IP. Instance is running.

**List 10 things to check:**
1.
2.
...
10.

---

### 2.15 Resize instance (10 pts)

**Task:** You need to upgrade t3.medium → t3.large without data loss.

**Your step-by-step process:**
1.
2.
...

---

## Level 3: Debugging Hell (150 points)

### 3.1 The mystery of the missing connection (15 pts)

**Problem:**
```bash
$ ssh -i key.pem ubuntu@54.123.45.67
ssh: connect to host 54.123.45.67 port 22: Connection timed out
```

Security group:
```
Type    Protocol    Port    Source
SSH     TCP         22      0.0.0.0/0
```

NACL: Default (allows all)
Instance: Running
Key: Correct

**What's wrong? How to debug? Provide exact commands.**

**Your debugging process:**

---

### 3.2 The case of the full disk (15 pts)

**Problem:**
Docker containers crashing with "no space left on device". But:
```bash
$ df -h
/dev/xvda1      30G    12G    18G   40%   /
```

**What's actually full? How to find and fix?**

**Your answer:**

---

### 3.3 The intermittent 502 error (15 pts)

**Scenario:**
- Nginx on EC2 proxying to Docker containers
- Works fine for 5 minutes
- Then 502 Bad Gateway for 30 seconds
- Then works again
- Repeats every 5 minutes

**Possible causes and how to diagnose?**

**Your answer:**

---

### 3.4 The phantom charges (15 pts)

**Problem:** Your AWS bill is $500 but you only have 1 t3.micro running. 

**How to find what's costing money?**

**Your debugging steps:**

---

### 3.5 The un-terminable instance (15 pts)

**Problem:**
```bash
$ aws ec2 terminate-instances --instance-ids i-12345
Error: OperationNotPermitted: Instance is protected
```

You didn't enable termination protection. What's happening?

**Your answer:**

---

### 3.6 The security group that doesn't work (15 pts)

**Setup:**
- Security Group allows HTTP (80) from 0.0.0.0/0
- Nginx running on port 80
- Instance firewall (UFW) disabled
- `curl localhost:80` works from inside instance
- `curl <public-ip>:80` times out from outside

**What's wrong? List ALL possibilities.**

**Your answer:**

---

### 3.7 The stolen credentials (15 pts)

**Scenario:** Your AWS access key was leaked on GitHub. You rotated it. But someone still accessing your account.

**What else could be compromised? How to secure?**

**Your answer:**

---

### 3.8 The network partition (15 pts)

**Setup:**
- 2 EC2 instances in same VPC, different AZs
- Security groups allow all traffic between them
- `ping <private-ip>` works
- Application can't connect on port 5432

**Why just this port? How to debug?**

**Your answer:**

---

### 3.9 The performance degradation (15 pts)

**Problem:** Application was fast, now slow. No code changes. EC2 metrics normal.

**Given:**
- t3.medium (burstable)
- Has been running 24/7 for a week
- CPU average: 40%

**What's likely happening?**

**Your answer:**

---

### 3.10 The AMI that won't launch (15 pts)

**Problem:** Created AMI from instance in us-east-1a. Can't launch in us-west-2.

**Error:** "AMI does not exist"

**Why? How to fix?**

**Your answer:**

---

## Level 4: Interview Scenarios (200 points)

### 4.1 Design resilient architecture (25 pts)

**Question:** "Design a highly available, fault-tolerant architecture for a web app with database."

**Requirements:**
- Survives AZ failure
- Auto-scales based on load
- Database highly available
- Cost-effective

**Your design (include diagram/description):**

---

### 4.2 Explain this bill (25 pts)

**Interviewer shows AWS bill:**
```
EC2 instances:        $300
Data Transfer OUT:    $2,500
EBS volumes:          $50
```

**Questions:**
1. What's unusual?
2. What could cause this?
3. How to reduce data transfer costs?

**Your answer:**

---

### 4.3 Security incident response (25 pts)

**Scenario:** S3 bucket with private data was public for 2 hours.

**Questions:**
1. How to check if data was accessed?
2. How to prevent future incidents?
3. What to tell customers?

**Your answer:**

---

### 4.4 Migration strategy (25 pts)

**Task:** Migrate on-premise app to AWS with zero downtime.

**Current:**
- 1 server with Docker Compose
- PostgreSQL database
- 10,000 active users
- Can't afford downtime

**Your migration plan:**

---

### 4.5 Cost optimization audit (25 pts)

**Given environment:**
- 10 t3.large (24/7)
- 5 TB EBS gp2
- 50 old EBS snapshots
- 3 unused Elastic IPs
- RDS db.r5.large (24/7)
- Data transfer: 2 TB/month

**Audit and recommend 40% cost reduction:**

**Your answer:**

---

### 4.6 Disaster recovery plan (25 pts)

**Scenario:** EC2 instance deleted accidentally. EBS volume exists.

**Questions:**
1. How to recover?
2. How to prevent future accidents?
3. Design DR strategy with RTO < 1 hour

**Your answer:**

---

### 4.7 Performance troubleshooting (25 pts)

**Problem:** API response time increased from 100ms to 2s.

**Given:**
- EC2 metrics: Normal
- Database: Normal
- Network: Normal
- No code changes

**Your debugging approach:**

---

### 4.8 Compliance and governance (25 pts)

**Requirement:** All EC2 instances must:
- Have Owner tag
- Run approved AMIs only
- Enable CloudWatch agent
- Encrypt all EBS volumes

**How to enforce this automatically?**

**Your answer:**

---

## Level 5: Chaos Engineering (250 points)

### 5.1 The Saturday night massacre (50 pts)

**Scenario:** 11 PM Saturday, you're drunk, you get paged:

```
ALERT: All EC2 instances TERMINATED
Suspected: Compromised AWS credentials
Timeline: Last 5 minutes
```

**Your emergency response plan (step-by-step):**

**Immediate (first 10 minutes):**

**Short-term (first hour):**

**Long-term (next day):**

---

### 5.2 Build un-hackable fortress (50 pts)

**Challenge:** Design the most secure EC2 setup possible.

**Requirements:**
- Web app must be accessible
- Even YOU can't SSH without 2FA
- Survives DDoS
- Auto-patches vulnerabilities
- Detects and blocks intrusions

**Your architecture:**

---

### 5.3 The $10,000/month challenge (50 pts)

**Budget:** $10,000/month AWS budget for CodeArena

**Requirements:**
- Handle 1M requests/day
- 99.9% uptime
- Global users (low latency)
- Auto-scaling
- Full monitoring
- Disaster recovery

**Design complete architecture with cost breakdown:**

---

### 5.4 Break and fix exercise (50 pts)

**Task:** Set up an EC2 instance, then intentionally break it in 10 different ways. Document each break and fix.

**Your 10 scenarios:**

1. **Break:**
   **Symptom:**
   **Fix:**

2. **Break:**
   **Symptom:**
   **Fix:**

... (continue for all 10)

---

### 5.5 The impossible interview question (50 pts)

**Question:** "You wake up Monday. Your EC2 is running but completely unreachable. No SSH, no HTTP, no ping. It shows 'running' in console. What do you do?"

**Constraints:**
- You deleted the key pair file
- Only you have root access
- Production data on it
- No snapshots

**Your answer:**

---

## Evaluation Criteria

### Self-Assessment:

**Total Points:** _____ / 850

**Your grade:**
- 850-800: **LEGEND** 🏆 - You're interview-ready for FAANG
- 799-750: **MASTER** 💪 - Hire this person
- 749-600: **PASS** ✅ - Solid foundation
- 599-400: **NEEDS WORK** ⚠️ - Review guide again
- <400: **START OVER** 🔄 - Docker was easier, right?

---

## What to do with results:

1. **For questions you struggled with:**
   - Review that section in 02_AWS_GUIDE.md
   - Practice the commands
   - Try again in a week

2. **For questions you aced:**
   - Great, but can you do it blindfolded?
   - Teach it to someone
   - Document your approach

3. **Level 5 incomplete?**
   - Totally normal
   - These are "stretch goals"
   - Come back after gaining real experience

---

## Next Steps:

1. Score yourself honestly
2. If < 600: Review guide, retry test
3. If ≥ 600: Move to **03_NGINX_GUIDE.md**
4. Keep this test - you'll retake it in 3 months and crush it

---

**Remember:** The test has no solutions. That's intentional. Real problems don't come with answer keys.

Figure it out. That's the job. 😈

Good luck! 🚀
