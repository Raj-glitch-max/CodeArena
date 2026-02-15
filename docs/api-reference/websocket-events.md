# WebSocket Events Reference

Server URL: `ws://localhost:3000` (Docker Compose) or `ws://ws.codearena.local` (Kubernetes)

## Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  auth: {
    token: 'Bearer eyJhbGci...'
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => console.log('Connected'));
socket.on('connect_error', (err) => console.error('Connection failed:', err.message));
```

## Client → Server Events

### `join_battle`
Join a battle room to receive live updates.
```javascript
socket.emit('join_battle', { battleId: 'battle-uuid' });
```

### `leave_battle`
Leave a battle room.
```javascript
socket.emit('leave_battle', { battleId: 'battle-uuid' });
```

### `code_update`
Send live code progress to opponent.
```javascript
socket.emit('code_update', {
  battleId: 'battle-uuid',
  code: 'function solution() { ... }',
  percentage: 75  // estimated completion
});
```

### `submit_code`
Submit final solution.
```javascript
socket.emit('submit_code', {
  battleId: 'battle-uuid',
  code: 'function solution(n) { return n * 2; }',
  language: 'javascript'
});
```

### `join_matchmaking`
Enter the matchmaking queue.
```javascript
socket.emit('join_matchmaking', { userId: 'user-uuid' });
```

## Server → Client Events

### `battle_started`
Emitted when both players are ready and battle begins.
```javascript
socket.on('battle_started', (data) => {
  // data = {
  //   battleId: 'battle-uuid',
  //   opponent: { id: 'uuid', username: 'player2', rating: 1450 },
  //   problem: { id: 'two-sum', title: 'Two Sum', description: '...' },
  //   timeLimit: 300
  // }
});
```

### `opponent_progress`
Live opponent coding progress.
```javascript
socket.on('opponent_progress', (data) => {
  // data = { percentage: 60 }
});
```

### `battle_result`
Battle completed — results for both players.
```javascript
socket.on('battle_result', (data) => {
  // data = {
  //   winner: 'user-uuid',
  //   scores: { player1: 100, player2: 85 },
  //   ratingChanges: { player1: +25, player2: -12 }
  // }
});
```

### `match_found`
Matchmaking found an opponent.
```javascript
socket.on('match_found', (data) => {
  // data = {
  //   battleId: 'battle-uuid',
  //   opponent: { id: 'uuid', username: 'player2', rating: 1200 }
  // }
});
```

### `error`
Server-side error notification.
```javascript
socket.on('error', (data) => {
  // data = { message: 'Battle not found' }
});
```

## Authentication

WebSocket connections are authenticated on the server side:
1. Client sends JWT in `auth.token` handshake param
2. Server middleware calls auth-service `/api/auth/verify`
3. If invalid, connection is rejected with `connect_error`

## Multi-Replica Support

Socket.IO uses Redis adapter for cross-pod event distribution. Events emitted on one pod are broadcast to all pods via Redis pub/sub. This is transparent to the client.
