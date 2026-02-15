# Auth API Reference

Base URL: `http://localhost:3001/api/auth`

## Endpoints

### POST /register

Create a new user account.

**Request:**
```json
{
  "username": "player1",
  "email": "player1@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "player1",
    "email": "player1@example.com",
    "rating": 1200
  }
}
```

**Errors:**
| Status | Message | Cause |
|--------|---------|-------|
| 400 | `Username already exists` | Duplicate username |
| 400 | `Email already registered` | Duplicate email |
| 400 | `Password must be at least 6 characters` | Validation |

---

### POST /login

Authenticate and receive a JWT.

**Request:**
```json
{
  "email": "player1@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "player1",
    "email": "player1@example.com",
    "rating": 1200
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 401 | `Invalid credentials` |

---

### GET /me

Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "a1b2c3d4-...",
  "username": "player1",
  "email": "player1@example.com",
  "rating": 1200,
  "createdAt": "2026-01-15T10:30:00Z"
}
```

---

### GET /verify

Internal endpoint for service-to-service JWT validation.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "valid": true,
  "userId": "a1b2c3d4-...",
  "username": "player1"
}
```

---

### GET /health

Health check endpoint (no auth required).

**Response (200):**
```json
{
  "status": "ok",
  "service": "auth-service"
}
```
