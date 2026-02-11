# Security & Production Hardening

**Goal:** Lock down production, prevent breaches, prepare for disasters

## Part 1: Security Principles

### Defense in Depth
Multiple layers of security. If one fails, others protect.

### Least Privilege
Give minimum access needed, nothing more.

### Zero Trust
Never trust, always verify.

---

## Part 2: Secrets Management

### AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name codearena/db \
  --secret-string '{"password":"super_secure_123"}'

# Get secret
aws secretsmanager get-secret-value --secret-id codearena/db
```

**In app:**
```javascript
const AWS = require('aws-sdk');
const secrets = new AWS.SecretsManager();

async function getDBPassword() {
  const data = await secrets.getSecretValue({ SecretId: 'codearena/db' }).promise();
  return JSON.parse(data.SecretString).password;
}
```

---

### HashiCorp Vault

```bash
# Start Vault
docker run -d --name=vault -p 8200:8200 vault

# Initialize
vault operator init

# Store secret
vault kv put secret/db password=super_secure_123

# Get secret
vault kv get secret/db
```

---

## Part 3: SSL/TLS Best Practices

**Nginx SSL config:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Test:** https://www.ssllabs.com/ssltest/

---

## Part 4: Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (careful!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow from specific IP
sudo ufw allow from 203.0.113.5 to any port 22

# Deny specific IP
sudo ufw deny from 198.51.100.5

# Status
sudo ufw status

# Delete rule
sudo ufw delete allow 80/tcp
```

---

## Part 5: SSH Hardening

**/etc/ssh/sshd_config**
```bash
# Disable root login
PermitRootLogin no

# Disable password auth (key only)
PasswordAuthentication no

# Change default port
Port 2222

# Only allow specific user
AllowUsers ubuntu

# Timeout idle sessions
ClientAliveInterval 300
ClientAliveCountMax 2
```

```bash
# Restart SSH
sudo systemctl restart sshd
```

---

## Part 6: Docker Security

**Don't run as root:**
```dockerfile
USER nodejs
```

**Read-only filesystem:**
```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
```

**No privileged mode:**
```yaml
# BAD
privileged: true

# GOOD
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE
```

**Scan images:**
```bash
docker scan yourusername/auth-service:latest
```

---

## Part 7: Database Security

### Encrypted connections

**PostgreSQL:**
```bash
# Generate self-signed cert
openssl req -new -x509 -days 365 -nodes \
  -text -out server.crt -keyout server.key

# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

**Connection:**
```javascript
const pool = new Pool({
  ssl: {
    rejectUnauthorized: false  // Production: true + proper CA
  }
});
```

### Backups

```bash
# Backup
docker exec postgres pg_dump -U postgres codearena > backup.sql

# Encrypted backup
pg_dump codearena | gpg -e -r you@email.com > backup.sql.gpg

# Restore
psql codearena < backup.sql

# Automated daily backups
0 2 * * * /usr/local/bin/backup-db.sh
```

---

## Part 8: Audit Logging

**CloudTrail (AWS):**
- Logs all API calls
- Who did what, when

**Application logs:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

// Log sensitive actions
logger.info('User login', {
  userId: user.id,
  ip: req.ip,
  timestamp: new Date()
});
```

---

## Part 9: DDoS Protection

### Rate limiting (Nginx)
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
  limit_req zone=api burst=20 nodelay;
    limit_req_status 429;
}
```

### CloudFlare
- Free DDoS protection
- CDN caching
- Web Application Firewall (WAF)

### AWS Shield
- Standard (free) - network layer
- Advanced ($3000/month) - application layer

---

## Part 10: Disaster Recovery

### RTO vs RPO
- **RTO (Recovery Time Objective):** How long until back online?
- **RPO (Recovery Point Objective):** How much data loss acceptable?

### Backup strategy (3-2-1 rule)
- **3** copies of data
- **2** different media types
- **1** copy offsite

### Database backups
```bash
# Daily full backups
0 2 * * * pg_dump codearena | aws s3 cp - s3://backup/daily/$(date +\%Y-\%m-\%d).sql

# Keep 7 days, then weekly, then monthly
```

### Infrastructure as Code
- Entire infrastructure in Terraform
- Can rebuild from scratch in minutes

---

## Part 11: Compliance

### GDPR
- Data encryption
- Right to deletion
- Data portability
- Breach notification (72 hours)

### PCI DSS (if handling payments)
- Encrypt card data
- Secure network
- Regular testing
- Access control

### SOC 2
- Security controls
- Availability
- Confidentiality
- Audit trail

---

## Part 12: Incident Response Plan

### 1. Detection
- Monitoring alerts
- User reports
- Security scans

### 2. Containment
- Isolate affected systems
- Block malicious IPs
- Disable compromised accounts

### 3. Eradication
- Remove malware
- Patch vulnerabilities
- Rotate credentials

### 4. Recovery
- Restore from backups
- Verify system integrity
- Resume operations

### 5. Lessons Learned
- Root cause analysis
- Update procedures
- Improve defenses

---

## Part 13: Security Checklist

**Infrastructure:**
- [ ] Firewall configured (UFW/Security Groups)
- [ ] SSH hardened (no root, key-only)
- [ ] SSL certificate (A+ rating)
- [ ] Regular updates automated
- [ ] Intrusion detection (fail2ban)
- [ ] DDoS protection (CloudFlare/Shield)

**Application:**
- [ ] Secrets in AWS Secrets Manager
- [ ] No hardcoded credentials
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input validation
- [ ] Dependency scanning

**Database:**
- [ ] Encrypted connections (SSL)
- [ ] Encrypted at rest
- [ ] Strong passwords
- [ ] Least privilege users
- [ ] Regular backups
- [ ] Backup restoration tested

**Monitoring:**
- [ ] Security logs enabled
- [ ] Failed login alerts
- [ ] Unusual traffic alerts
- [ ] Resource usage alerts
- [ ] Log retention policy

**Compliance:**
- [ ] Data encryption
- [ ] Access audit trail
- [ ] Privacy policy
- [ ] Terms of service
- [ ] GDPR compliance (if EU users)

---

## Part 14: Penetration Testing

**Tools:**
```bash
# Port scanning
nmap -A your-server.com

# Web vulnerability scan
nikto -h https://your-site.com

# SQL injection testing
sqlmap -u "https://your-site.com/api/user?id=1"

# SSL testing
testssl.sh your-site.com
```

**Bug bounty:**
- HackerOne
- Bugcrowd
- Offer rewards for finding vulnerabilities

---

## Part 15: Cost Optimization

### Right-sizing
- Monitor actual usage
- Downsize over-provisioned resources

### Reserved Instances
- 30-70% cheaper for 1-3 year commit

### Spot Instances
- 90% cheaper for flexible workloads

### Auto-scaling
- Scale down during low traffic

### Delete unused resources
- Old snapshots
- Unused Elastic IPs
- Stopped instances

### S3 lifecycle policies
- Move old data to cheaper storage tiers

---

**Next:** Take 08_SECURITY_TEST.md - Final brutal test!
