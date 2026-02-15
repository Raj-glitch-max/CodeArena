# Rating Service

## Overview

ELO rating system service. Calculates and tracks player ratings after each battle, provides leaderboard data.

- **Port**: 3004
- **Stack**: Node.js 20 + Express + TypeScript
- **Database**: PostgreSQL (owns `ratings`, `rating_history` tables)
- **Cache**: Redis (leaderboard cache)
- **Source**: `backend/services/rating-service/`

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/rating/:userId` | Yes | Get user's rating |
| `GET` | `/api/rating/leaderboard` | No | Top players |
| `POST` | `/api/rating/update` | Internal | Update after battle |
| `GET` | `/health` | No | Health check |
| `GET` | `/metrics` | No | Prometheus metrics |

### GET /api/rating/leaderboard
```json
// Response (200)
{
  "leaderboard": [
    { "userId": "uuid", "username": "player1", "rating": 1850, "wins": 42, "losses": 12 },
    { "userId": "uuid", "username": "player2", "rating": 1720, "wins": 38, "losses": 18 }
  ]
}
```

## ELO Algorithm

Standard ELO formula with K=32:

```
Expected score: E = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
New rating: R_new = R_old + K * (actual_score - expected_score)
```

- Win: `actual_score = 1`
- Loss: `actual_score = 0`
- K-factor of 32 means ratings adjust quickly — appropriate for a competitive platform where players improve rapidly

Starting rating for all new users: **1200**.

## Kubernetes Deployment

- **Replicas**: 2 (min) → 8 (max via HPA at 70% CPU)
- **Resources**: 200m CPU / 256Mi (request), 500m CPU / 512Mi (limit)
- **Manifest**: `k8s/base/rating-service.yaml`
