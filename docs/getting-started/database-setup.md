# Database Setup

## PostgreSQL 15

CodeArena uses a single PostgreSQL 15 database (`codearena`) shared by three services. Each service owns its tables.

### Docker Compose
PostgreSQL starts automatically via `docker compose up`. The database is created via the `POSTGRES_DB` env var.

### Kubernetes
PostgreSQL runs as a StatefulSet with a 5Gi PersistentVolumeClaim:
```bash
kubectl apply -f k8s/base/postgres.yaml
```

### Connection Details

| Environment | Host | Port | Database | User | Password |
|-------------|------|------|----------|------|----------|
| Docker Compose | `postgres` | 5432 | `codearena` | `postgres` | `postgres123` |
| Kubernetes | `postgres.codearena.svc` | 5432 | `codearena` | `postgres` | `postgres123` |
| AWS (RDS) | RDS endpoint | 5432 | `codearena` | per `.env.production` | per Secrets Manager |

### Schema

Tables are auto-created by each service on startup via their ORM/migration system. The key tables:

**auth-service owns:**
```sql
users (
    id          UUID PRIMARY KEY,
    username    VARCHAR(255) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hash
    rating      INTEGER DEFAULT 1200,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
)
```

**battle-service owns:**
```sql
battles (
    id              UUID PRIMARY KEY,
    status          VARCHAR(50),     -- 'waiting', 'active', 'completed'
    created_by      UUID REFERENCES users(id),
    problem_id      VARCHAR(255),
    time_limit      INTEGER,         -- seconds
    created_at      TIMESTAMP DEFAULT NOW()
)

battle_participants (
    id          UUID PRIMARY KEY,
    battle_id   UUID REFERENCES battles(id),
    user_id     UUID REFERENCES users(id),
    submission  TEXT,
    result      VARCHAR(50),     -- 'pass', 'fail', 'timeout'
    score       INTEGER
)
```

**rating-service owns:**
```sql
ratings (
    id          UUID PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    rating      INTEGER DEFAULT 1200,
    wins        INTEGER DEFAULT 0,
    losses      INTEGER DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT NOW()
)
```

### Connecting manually

```bash
# Docker Compose
docker exec -it codearena-postgres psql -U postgres -d codearena

# Kubernetes
kubectl exec -it postgres-0 -n codearena -- psql -U postgres -d codearena

# List tables
\dt

# Check data
SELECT id, username, rating FROM users ORDER BY rating DESC LIMIT 10;
```

### Backup

```bash
# Docker Compose
docker exec codearena-postgres pg_dump -U postgres codearena > backup.sql

# Kubernetes
kubectl exec postgres-0 -n codearena -- pg_dump -U postgres codearena > backup.sql

# Restore
cat backup.sql | kubectl exec -i postgres-0 -n codearena -- psql -U postgres -d codearena
```
