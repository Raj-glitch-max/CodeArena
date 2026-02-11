# Nginx Brutal Test - Master the Web Server

**Total:** 700 points across 5 levels

---

## Level 1: Fundamentals (100 points)

### 1.1 What's the difference between Nginx and Apache? (5 pts)

**Your answer:**

---

### 1.2 Explain: web server, reverse proxy, load balancer (5 pts)

**Your answer:**

---

### 1.3 What does this location block do? (5 pts)
```nginx
location /api/ {
    proxy_pass http://backend:3000/;
}
```

**Your answer:**

---

### 1.4 Write command to test Nginx config without applying (5 pts)

**Your command:**

---

### 1.5 What's the difference between `reload` and `restart`? (5 pts)

**Your answer:**

---

### 1.6 Where are Nginx logs stored on Ubuntu? (5 pts)

**Your answer:**

---

### 1.7 Explain `listen 80` vs `listen 443 ssl` (5 pts)

**Your answer:**

---

### 1.8 What is Let's Encrypt? (5 pts)

**Your answer:**

---

### 1.9 Write command to get SSL cert for domain.com (5 pts)

**Your command:**

---

### 1.10 How often do Let's Encrypt certs expire? (5 pts)

**Your answer:**

---

### 1.11 What does `proxy_set_header X-Real-IP $remote_addr` do? (5 pts)

**Your answer:**

---

### 1.12 Explain upstream in Nginx (5 pts)

**Your answer:**

---

### 1.13 What's the default load balancing algorithm? (5 pts)

**Your answer:**

---

### 1.14 What does `return 301 https://$server_name$request_uri` do? (5 pts)

**Your answer:**

---

### 1.15 Where do you enable sites in Nginx? (5 pts)

**Your answer:**

---

### 1.16 What is `try_files $uri $uri/ =404`? (5 pts)

**Your answer:**

---

### 1.17 How to view active Nginx connections? (5 pts)

**Your command:**

---

### 1.18 What is gzip compression and why use it? (5 pts)

**Your answer:**

---

### 1.19 Explain `worker_processes auto` (5 pts)

**Your answer:**

---

### 1.20 What does 502 Bad Gateway mean? (5 pts)

**Your answer:**

---

## Level 2: Configuration Building (150 points)

### 2.1 Basic reverse proxy config (15 pts)

**Task:** Configure Nginx to:
- Listen on port 80
- Proxy all requests to localhost:3000
- Pass client IP to backend

**Your config:**
```nginx

```

---

### 2.2 Static site with SPA routing (15 pts)

**Task:** Serve React app from `/var/www/app` where all routes should return index.html

**Your config:**
```nginx

```

---

### 2.3 API and frontend routing (15 pts)

**Task:**
- `/` → Frontend on port 8083
- `/api/*` → Backend on port 3001
- Remove `/api` prefix when forwarding

**Your config:**
```nginx

```

---

### 2.4 SSL configuration (15 pts)

**Task:** Configure HTTPS with:
- SSL cert from Let's Encrypt
- Redirect HTTP to HTTPS
- A+ SSL rating security

**Your config:**
```nginx

```

---

### 2.5 Load balancer setup (15 pts)

**Task:** Load balance across 3 servers:
- server1.com
- server2.com (2x weight)
- server3.com
Use least connections method

**Your config:**
```nginx

```

---

### 2.6 WebSocket proxy (15 pts)

**Task:** Proxy WebSocket connections to localhost:3000/socket.io

**Your config:**
```nginx

```

---

### 2.7 Rate limiting (15 pts)

**Task:** Limit `/api/` to 100 requests/minute per IP

**Your config:**
```nginx

```

---

### 2.8 Basic authentication (15 pts)

**Task:** Protect `/admin/` with username/password

**Your commands + config:**
```bash

```

---

### 2.9 IP whitelisting (15 pts)

**Task:** Only allow office network 10.0.0.0/8 to access `/internal/`

**Your config:**
```nginx

```

---

### 2.10 Custom error pages (15 pts)

**Task:** Show custom 404 and 500 pages from `/var/www/errors/`

**Your config:**
```nginx

```

---

## Level 3: Debugging Production Issues (150 points)

### 3.1 The 502 mystery (20 pts)

**Problem:** Getting 502 Bad Gateway randomly

**Error log shows:**
```
connect() to unix:/var/run/backend.sock failed (2: No such file or directory)
```

**Your diagnosis and fix:**

---

### 3.2 SSL certificate won't renew (20 pts)

**Problem:**
```bash
$ sudo certbot renew
Failed to renew certificate with error: Challenge timed out
```

**List 5 possible causes and how to check each:**

---

### 3.3 High CPU usage (20 pts)

**Problem:** Nginx using 100% CPU

```bash
$ ps aux | grep nginx
www-data  1234  98.0  2.5  ...  nginx: worker process
```

**How to diagnose and fix?**

---

### 3.4 Upload fails (20 pts)

**Problem:** File uploads > 2MB fail with 413 error

**What's wrong and how to fix?**

---

### 3.5 Websocket disconnects (20 pts)

**Problem:** WebSocket works for 60 seconds then disconnects

**Possible causes and solutions:**

---

### 3.6 Cache not working (20 pts)

**Config:**
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
location / {
    proxy_cache my_cache;
    proxy_pass http://backend;
}
```

**Check headers:**
```bash
$ curl -I http://example.com
X-Cache-Status: MISS
X-Cache-Status: MISS  # Every request!
```

**Why no caching? Fix it.**

---

### 3.7 Permission denied (20 pts)

**Problem:**
```
open() "/var/www/html/index.html" failed (13: Permission denied)
```

**File exists, config looks correct. What's wrong?**

---

### 3.8 Slow response times (20 pts)

**Problem:** API responds in 100ms when tested directly, but 5s through Nginx

**How to diagnose?**

---

## Level 4: Advanced Scenarios (200 points)

### 4.1 Blue-green deployment (25 pts)

**Task:** Design Nginx config for zero-downtime deployment

**Requirements:**
- Two backend pools (blue, green)
- Route test traffic to green
- Route production to blue
- Easy switching

**Your design:**

---

### 4.2 Microservices routing (25 pts)

**Architecture:**
- Auth: localhost:3001
- Users: localhost:3002
- Orders: localhost:3003
- Payments: localhost:3004

**Routes:**
- `/auth/*` → Auth
- `/users/*` → Users  
- `/orders/*` → Orders
- `/pay/*` → Payments

**Additional:**
- Rate limit payments: 10/min
- Cache user data: 5min
- Sticky sessions for auth

**Your complete config:**

---

### 4.3 Geo-blocking (25 pts)

**Task:** Block all traffic from China and Russia, except your office IP (1.2.3.4)

**How would you implement this?**

---

### 4.4 A/B testing (25 pts)

**Task:** Route 90% traffic to backend-v1, 10% to backend-v2 based on random

**Your implementation:**

---

### 4.5 Monitoring setup (25 pts)

**Task:** Enable Nginx status page and configure custom metrics

**Requirements:**
- Active connections
- Requests per second
- Response time percentiles
- Export to Prometheus

**Your approach:**

---

### 4.6 DDoS mitigation (25 pts)

**Scenario:** Site under DDoS attack (10k req/sec from multiple IPs)

**Implement protection:**
- Connection limits
- Rate limits
- Request filtering
- WAF integration

**Your config:**

---

### 4.7 Multi-domain hosting (25 pts)

**Task:** Host 3 domains on single Nginx:
- api.company.com → Backend:3000
- www.company.com → Frontend:8080
- admin.company.com → Admin:9000 (password protected)

All with SSL, HTTP→HTTPS redirect

**Your config:**

---

### 4.8 Performance optimization (25 pts)

**Given:** Serving 1M requests/day, site feels slow

**Task:** Optimize Nginx config for maximum performance

**Show:**
- Buffer tuning
- Connection optimization  
- Caching strategy
- Compression
- Worker tuning

**Your optimized config:**

---

## Level 5: Chaos & Mastery (100 points)

### 5.1 The production disaster (25 pts)

**Scenario:** Friday 5 PM, you push new Nginx config:

```nginx
server {
    listen 80;
    server_name api.company.com;
    location / {
        proxy_pass htttp://backend;  # Typo!
    }
}
```

Reload Nginx. **Everything down.**

**Problems:**
1. Config has typo but `nginx -t` passed
2. All sites now 503
3. Can't rollback (old config lost)

**Your recovery plan:**

---

###5.2 Build self-healing Nginx (25 pts)

**Challenge:** Design system where:
- Nginx auto-detects backend failures
- Removes unhealthy backends
- Auto-restores when healthy
- Alerts you
- Logs everything

**Your architecture:**

---

### 5.3 The mysterious caching bug (25 pts)

**Problem:** Users see each other's data!

**Setup:**
- Nginx caching enabled
- Auth API returns user data
- Cache key based on URL only

User A requests `/api/profile` → sees their data → good
User B requests `/api/profile` → sees User A's data! → BAD

**What's wrong? How to fix? Prevent future bugs?**

---

### 5.4 Design Fort Knox (25 pts)

**Challenge:** Most secure Nginx setup possible for payment processing

**Requirements:**
- PCI DSS compliant
- Zero-trust architecture
- DDoS protected
- Rate limited
- Geo-restricted
- Monitored
- Audited
- Auto-updated

**Your complete design:**

---

## Scoring

**Total:** _____ / 700

- 700-650: **LEGEND** 🏆
- 649-550: **MASTER** 💪
- 549-420: **PASS** ✅
- <420: **RETRY** 🔄

---

## What's Next?

- < 420: Review 03_NGINX_GUIDE.md, retry
- ≥ 420: Move to **04_CICD_GUIDE.md**

Good luck! 🚀
