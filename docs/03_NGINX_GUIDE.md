# Nginx Mastery - Reverse Proxy, Load Balancing & SSL

**Goal:** Set up professional web server infrastructure with Nginx

**Why Nginx?**
- High-performance web server & reverse proxy
- Used by 30%+ of top websites
- Handles 10,000+ concurrent connections easily
- Perfect for microservices architecture

---

## Part 1: Core Concepts

### What is Nginx?

**Three roles:**

1. **Web Server**
   - Serves static files (HTML, CSS, images)
   - Like Apache, but faster

2. **Reverse Proxy**
   - Sits in front of backend services
   - Routes requests to correct service
   - Hides backend complexity

3. **Load Balancer**
   - Distributes traffic across multiple servers
   - Scales horizontally

---

### Reverse Proxy Explained

**Without Nginx:**
```
User → http://example.com:3001 (Auth)
User → http://example.com:3002 (Battle)
User → http://example.com:3004 (Rating)
```

**With Nginx:**
```
User → http://example.com/api/auth → Nginx → Backend:3001
User → http://example.com/api/battle → Nginx → Backend:3002
User → http://example.com/api/rating → Nginx → Backend:3004
```

**Benefits:**
- Single entry point
- Hide internal ports
- SSL termination
- Caching
- Rate limiting

---

## Part 2: Installation & Setup

### Install on Ubuntu

```bash
# Update
sudo apt update

# Install Nginx
sudo apt install nginx -y

# Verify
nginx -v
# nginx version: nginx/1.18.0

# Check status
sudo systemctl status nginx
```

### Important Directories

```bash
/etc/nginx/
├── nginx.conf              # Main config
├── sites-available/        # All site configs
│   └── default
├── sites-enabled/          # Active site configs (symlinks)
│   └── default -> ../sites-available/default
├── conf.d/                 # Additional configs
└── snippets/               # Reusable config snippets

/var/www/html/              # Default web root
/var/log/nginx/             # Logs
├── access.log
└── error.log
```

---

### Basic Commands

```bash
# Start Nginx
sudo systemctl start nginx

# Stop Nginx
sudo systemctl stop nginx

# Restart Nginx (stops then starts)
sudo systemctl restart nginx

# Reload config without downtime
sudo systemctl reload nginx

# Enable auto-start on boot
sudo systemctl enable nginx

# Test config before applying
sudo nginx -t

# Show config
nginx -T
```

---

## Part 3: Configuration Basics

### nginx.conf Structure

```nginx
# Global settings
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;  # Max connections per worker
}

http {
    # HTTP settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Include all sites
    include /etc/nginx/sites-enabled/*;
}
```

---

### Server Block (Virtual Host)

**File:** `/etc/nginx/sites-available/codearena`

```nginx
server {
    listen 80;                          # Port
    server_name codearena.com;          # Domain

    # Access logs
    access_log /var/log/nginx/codearena_access.log;
    error_log /var/log/nginx/codearena_error.log;

    # Root directory
    root /var/www/codearena;
    index index.html;

    # Route all requests
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Enable site:**
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/codearena /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Part 4: Reverse Proxy Setup

### Basic Reverse Proxy

**Scenario:** Frontend on port 8083, backend on 3001-3004

```nginx
server {
    listen 80;
    server_name codearena.com;

    # Frontend (SPA)
    location / {
        proxy_pass http://localhost:8083;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth service
    location /api/auth {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Battle service
    location /api/battle {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Rating service
    location /api/rating {
        proxy_pass http://localhost:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

### Proxy Headers Explained

```nginx
proxy_set_header Host $host;
# Passes original domain to backend
# Backend sees: "Host: codearena.com" not "localhost:3001"

proxy_set_header X-Real-IP $remote_addr;
# Passes client's IP
# Backend sees actual user IP, not Nginx IP

proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
# Chain of IPs if multiple proxies
# Format: "client, proxy1, proxy2"

proxy_set_header X-Forwarded-Proto $scheme;
# http or https
# Backend knows if original request was  secure
```

---

## Part 5: SSL/TLS with Let's Encrypt

### What is SSL/TLS?

- **SSL:** Secure Sockets Layer (old, deprecated)
- **TLS:** Transport Layer Security (current)
- Encrypts traffic between user and server
- Prevents man-in-the-middle attacks

**HTTP vs HTTPS:**
```
HTTP:  User → [plain text] → Server
HTTPS: User → [encrypted] → Server
```

---

### Install Certbot (Let's Encrypt)

```bash
# Install Certbot + Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# Verify
certbot --version
```

---

### Get SSL Certificate

**Prerequisites:**
- Domain pointing to your server
- Nginx running
- Port 80 open

```bash
# Automatic setup (recommended)
sudo certbot --nginx -d codearena.com -d www.codearena.com

# Follow prompts:
# 1. Email for renewal notices
# 2. Agree to ToS
# 3. Share email? (up to you)
# 4. Redirect HTTP to HTTPS? YES
```

**What Certbot does:**
1. Verifies you own the domain
2. Issues SSL certificate (free, 90 days)
3. Configures Nginx automatically
4. Sets up auto-renewal

---

### Manual Certificate (Understanding)

```bash
# Get certificate only (don't modify Nginx)
sudo certbot certonly --nginx -d codearena.com

# Certificates saved to:
# /etc/letsencrypt/live/codearena.com/fullchain.pem   # Public cert
# /etc/letsencrypt/live/codearena.com/privkey.pem     # Private key
```

**Configure Nginx manually:**
```nginx
server {
    listen 443 ssl;
    server_name codearena.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/codearena.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codearena.com/privkey.pem;

    # SSL settings (A+ rating)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    
    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name codearena.com;
    return 301 https://$server_name$request_uri;
}
```

---

### Auto-Renewa]
Certbot sets up cron job automatically:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer

# Manual renewal
sudo certbot renew
```

**Certificates expire every 90 days. Auto-renewal happens at 30 days.**

---

## Part 6: Load Balancing

### Upstream Servers

**Scenario:** 3 backend instances

```nginx
# Define upstream group
upstream backend_servers {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend_servers;
    }
}
```

---

### Load Balancing Methods

**1. Round Robin (default)**
```nginx
upstream backend {
    server backend1.com;
    server backend2.com;
    server backend3.com;
}
# Request 1 → backend1
# Request 2 → backend2
# Request 3 → backend3
# Request 4 → backend1 (repeats)
```

**2. Least Connections**
```nginx
upstream backend {
    least_conn;
    server backend1.com;
    server backend2.com;
}
# Routes to server with fewest active connections
```

**3. IP Hash (sticky sessions)**
```nginx
upstream backend {
    ip_hash;
    server backend1.com;
    server backend2.com;
}
# Same client IP always goes to same server
# Good for sessions
```

**4. Weighted**
```nginx
upstream backend {
    server backend1.com weight=3;  # Gets 3x traffic
    server backend2.com weight=1;
}
```

---

### Health Checks

**Basic:**
```nginx
upstream backend {
    server backend1.com max_fails=3 fail_timeout=30s;
    server backend2.com max_fails=3 fail_timeout=30s;
}
# After 3 failed requests, marks server down for 30s
```

---

## Part 7: Caching

### Proxy Cache

```nginx
# Define cache path
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

server {
    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 60m;      # Cache 200 responses for 60 min
        proxy_cache_valid 404 1m;       # Cache 404 for 1 min
        proxy_cache_bypass $http_cache_control;  # Respect Cache-Control headers
        
        add_header X-Cache-Status $upstream_cache_status;  # Debug header
        
        proxy_pass http://backend;
    }
}
```

**Cache headers:**
- `HIT` - Served from cache
- `MISS` - Not in cache, fetched from backend
- `BYPASS` - Bypassed cache

---

## Part 8: Security

### Rate Limiting

```nginx
# Limit requests per IP
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=one burst=20 nodelay;
        proxy_pass http://backend;
    }
}
# Allows 10 reqs/sec, burst up to 20, then blocks
```

---

### Block IPs

```nginx
# Deny specific IP
location / {
    deny 192.168.1.100;
    allow all;
}

# Allow only specific network
location /admin/ {
    allow 10.0.0.0/8;
    deny all;
}
```

---

### Basic Authentication

```bash
# Install tools
sudo apt install apache2-utils

# Create password file
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Enter password when prompted
```

```nginx
location /admin/ {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://backend;
}
```

---

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;
```

---

## Part 9: Logging & Monitoring

### Custom Log Format

```nginx
log_format detailed '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time';

access_log /var/log/nginx/access.log detailed;
```

**Fields:**
- `$remote_addr` - Client IP
- `$request` - HTTP method + path
- `$status` - Response code (200, 404, etc)
- `$request_time` - Total request time
- `$upstream_response_time` - Backend processing time

---

### Analyze Logs

```bash
# Get top 10 IPs
cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# Count status codes
cat /var/log/nginx/access.log | awk '{print $9}' | sort | uniq -c | sort -rn

# Slow requests (>1 second)
cat /var/log/nginx/access.log | awk '$10 > 1 {print $7, $10}' | sort -k2 -rn
```

---

## Part 10: Production Configuration

### Complete CodeArena Setup

**/etc/nginx/sites-available/codearena**

```nginx
# Upstream backends
upstream frontend {
    server localhost:8083;
}

upstream auth {
    server localhost:3001;
}

upstream battle {
    server localhost:3002;
}

upstream rating {
    server localhost:3004;
}

upstream websocket {
    server localhost:3000;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name codearena.com www.codearena.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name codearena.com www.codearena.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/codearena.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codearena.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /var/log/nginx/codearena_access.log;
    error_log /var/log/nginx/codearena_error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API routes
    location /api/auth/ {
        proxy_pass http://auth/api/auth/;
        include /etc/nginx/proxy_params;
    }

    location /api/battle/ {
        proxy_pass http://battle/api/battle/;
        include /etc/nginx/proxy_params;
    }

    location /api/rating/ {
        proxy_pass http://rating/api/rating/;
        include /etc/nginx/proxy_params;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://websocket/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        include /etc/nginx/proxy_params;
    }

    # Rate limiting for API
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:$proxy_port;
    }
}
```

**/etc/nginx/proxy_params** (reusable):
```nginx
proxy_set_header Host $http_host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_buffering off;
```

---

## Part 11: Common Errors & Fixes

### 502 Bad Gateway

**Cause:** Backend not running or unreachable

**Debug:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Look for:
# "connect() failed (111: Connection refused)"
```

**Fix:**
- Start backend service
- Check port numbers in Nginx config
- Check firewall/security groups

---

### 504 Gateway Timeout

**Cause:** Backend too slow

**Debug:**
```bash
# Check backend response time
curl -w "@-" -s http://localhost:3001 << 'EOF'
time_total: %{time_total}\n
EOF
```

**Fix:**
```nginx
# Increase timeout in Nginx
proxy_connect_timeout 600;
proxy_send_timeout 600;
proxy_read_timeout 600;
send_timeout 600;
```

---

### 403 Forbidden

**Cause:** Permission or SSL issues

**Debug:**
```bash
# Check file permissions
ls -la /var/www/codearena

# Check Nginx user
ps aux | grep nginx

# Should match:
# - Nginx runs as www-data
# - Files owned by www-data or readable by www-data
```

**Fix:**
```bash
sudo chown -R www-data:www-data /var/www/codearena
sudo chmod -R 755 /var/www/codearena
```

---

## Part 12: Performance Tuning

### Worker Processes

```nginx
# Set to number of CPU cores
worker_processes auto;

# Or manually:
worker_processes 4;
```

### Connections

```nginx
events {
    worker_connections 2048;  # Max per worker
    use epoll;                # Linux optimization
}
```

### Buffers

```nginx
http {
    client_body_buffer_size 10K;
    client_max_body_size 20M;    # Max upload size
    large_client_header_buffers 2 1k;
}
```

### Gzip Compression

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml;
```

---

## Commands Cheat Sheet

```bash
# Test config
sudo nginx -t

# Reload (no downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Get SSL cert
sudo certbot --nginx -d domain.com

# Renew SSL
sudo certbot renew

# Check open connections
sudo netstat -plan | grep nginx

# Nginx status (if enabled)
curl http://localhost/nginx_status
```

---

## Production Checklist

- [ ] SSL certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] Security headers configured
- [ ] Rate limiting on API endpoints
- [ ] Log rotation configured
- [ ] Monitoring enabled
- [ ] Firewall allows 80/443
- [ ] worker_processes set to auto
- [ ] Gzip compression enabled
- [ ] Cache configured for static assets
- [ ] Health checks on upstreams
- [ ] Auto-renewal for SSL working

---

## Next Steps

1. Take **03_NGINX_TEST.md**
2. Move to **04_CICD_GUIDE.md** (automate deployments)

You now have a production-grade web server. Time to automate it. 🚀
