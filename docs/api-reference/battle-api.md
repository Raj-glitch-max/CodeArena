# Battle API Reference

Base URL: `http://localhost:3002/api`

All endpoints require `Authorization: Bearer <token>` unless noted.

## Endpoints

### POST /battle/create

Create a new battle.

**Request:**
```json
{
  "problemId": "two-sum",
  "timeLimit": 300,
  "type": "1v1"
}
```

**Response (201):**
```json
{
  "id": "battle-uuid",
  "status": "waiting",
  "createdBy": "user-uuid",
  "problemId": "two-sum",
  "timeLimit": 300,
  "createdAt": "2026-02-15T10:30:00Z"
}
```

---

### GET /battle/:id

Get battle details.

**Response (200):**
```json
{
  "id": "battle-uuid",
  "status": "active",
  "createdBy": "user-uuid",
  "problemId": "two-sum",
  "timeLimit": 300,
  "participants": [
    {
      "userId": "user-1",
      "username": "player1",
      "score": 85,
      "result": "pass"
    },
    {
      "userId": "user-2",
      "username": "player2",
      "score": null,
      "result": null
    }
  ]
}
```

---

### GET /battle/history

Get authenticated user's battle history.

**Response (200):**
```json
{
  "battles": [
    {
      "id": "battle-uuid",
      "opponent": "player2",
      "result": "win",
      "ratingChange": "+25",
      "date": "2026-02-15T10:30:00Z"
    }
  ]
}
```

---

### POST /battle/:id/join

Join an existing battle.

**Response (200):**
```json
{
  "battleId": "battle-uuid",
  "status": "active",
  "message": "Battle started"
}
```

---

### POST /battle/:id/submit

Submit code solution for a battle.

**Request:**
```json
{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

**Response (200):**
```json
{
  "submissionId": "sub-uuid",
  "status": "queued"
}
```

The result is delivered asynchronously via WebSocket `battle_result` event.

---

### GET /health

**Response (200):**
```json
{
  "status": "ok",
  "service": "battle-service"
}
```
