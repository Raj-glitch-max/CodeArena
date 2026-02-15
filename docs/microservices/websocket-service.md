# WebSocket Service

## Overview

Socket.IO server handling all real-time features: live battle progress, matchmaking notifications, and code synchronization between players.

- **Port**: 3005 (K8s), 3000 (Docker Compose)
- **Stack**: Node.js 20 + Express + Socket.IO 4.8 + TypeScript
- **Cache**: Redis (pub/sub adapter for multi-replica support)
- **Source**: `backend/services/websocket-server/`

> **Note**: Port mismatch — Docker Compose uses `:3000`, Kubernetes uses `:3005`. The K8s service YAML maps `:3005` to whatever the container port is. Keep env vars consistent when switching environments.

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_battle` | `{ battleId: string }` | Join a battle room |
| `leave_battle` | `{ battleId: string }` | Leave a battle room |
| `code_update` | `{ battleId: string, code: string }` | Sync code progress |
| `submit_code` | `{ battleId: string, code: string, language: string }` | Submit final solution |
| `join_matchmaking` | `{ userId: string }` | Enter matchmaking queue |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `battle_started` | `{ battleId, opponent, problem }` | Battle matched and started |
| `opponent_progress` | `{ percentage: number }` | Live opponent progress |
| `battle_result` | `{ winner, scores, ratingChanges }` | Battle completed |
| `match_found` | `{ battleId, opponent }` | Matchmaking found a partner |
| `error` | `{ message: string }` | Error notification |

## Authentication

WebSocket connections are authenticated via JWT:
```javascript
// Client
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'Bearer eyJhbGci...'
  }
});

// Server middleware validates token on connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Calls auth-service /api/auth/verify
});
```

## Scaling with Redis Adapter

Without Redis, each WebSocket server replica only knows about its own connections. If Player A connects to pod-1 and Player B connects to pod-2, they can't communicate.

Socket.IO Redis adapter solves this — events published on one pod are received by all pods via Redis pub/sub:

```
Player A → Pod 1 → Redis pub/sub → Pod 2 → Player B
```

## Kubernetes Deployment

- **Replicas**: 3 (min) → 20 (max via HPA at 60% CPU)
- **Scale-down**: Very conservative — 1 pod per 120s, 10-minute stabilization window
- **Reason**: WebSocket connections are long-lived. Aggressive scale-down kills active connections, causing reconnection storms.
- **Ingress**: Separate ingress (`websocket-ingress`) with:
  - Sticky sessions via cookie (`codearena-ws-affinity`)
  - 3600s proxy timeout (1 hour keep-alive)
  - WebSocket upgrade headers
- **Manifest**: `k8s/base/websocket-service.yaml`
