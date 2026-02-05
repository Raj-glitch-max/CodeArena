 # CodeArena Backend Integration Guide
 
 > **Complete API Reference & Integration Specification for Backend Engineers**
 > 
 > This document provides everything needed to wire the FastAPI backend to this React frontend.
 
 ---
 
 ## Table of Contents
 
 1. [Architecture Overview](#1-architecture-overview)
 2. [Technology Stack](#2-technology-stack)
 3. [API Base Configuration](#3-api-base-configuration)
 4. [Authentication Flow](#4-authentication-flow)
 5. [API Endpoints Reference](#5-api-endpoints-reference)
 6. [WebSocket Integration](#6-websocket-integration)
 7. [Data Types & Schemas](#7-data-types--schemas)
 8. [Frontend Pages & Their API Dependencies](#8-frontend-pages--their-api-dependencies)
 9. [Error Handling](#9-error-handling)
 10. [Real-time Features](#10-real-time-features)
 11. [Testing the Integration](#11-testing-the-integration)
 
 ---
 
 ## 1. Architecture Overview
 
 ```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                           FRONTEND (React)                         │
 │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
 │  │ Landing  │ │Dashboard │ │ Problems │ │ Battles  │ │Leaderboard│ │
 │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
 │       │            │            │            │            │        │
 │       └────────────┴────────────┴────────────┴────────────┘        │
 │                              │                                      │
 │                    ┌─────────┴─────────┐                           │
 │                    │    API Client     │                           │
 │                    │  (axios + auth)   │                           │
 │                    └─────────┬─────────┘                           │
 └────────────────────────────────┼───────────────────────────────────┘
                                  │ HTTP/WS
 ┌────────────────────────────────┼───────────────────────────────────┐
 │                      BACKEND (FastAPI)                             │
 │                    ┌─────────┴─────────┐                           │
 │                    │   /api/v1/...     │                           │
 │                    └─────────┬─────────┘                           │
 │       ┌──────────────────────┼──────────────────────┐              │
 │       │                      │                      │              │
 │  ┌────┴────┐          ┌──────┴──────┐        ┌──────┴──────┐       │
 │  │  Auth   │          │  Services   │        │  WebSocket  │       │
 │  │  JWT    │          │ (Business)  │        │  Battles    │       │
 │  └────┬────┘          └──────┬──────┘        └──────┬──────┘       │
 │       │                      │                      │              │
 │  ┌────┴──────────────────────┴──────────────────────┴────┐         │
 │  │              PostgreSQL + Redis                       │         │
 │  └───────────────────────────────────────────────────────┘         │
 └────────────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 ## 2. Technology Stack
 
 ### Frontend
 - **React 18** with TypeScript
 - **Vite** for bundling
 - **TailwindCSS** for styling
 - **Axios** for HTTP requests
 - **Monaco Editor** for code editing
 - **Framer Motion** for animations
 - **React Router v6** for routing
 
 ### Backend (Expected)
 - **FastAPI** 0.104+
 - **SQLAlchemy 2.0** (async, asyncpg driver)
 - **PostgreSQL 15+**
 - **Redis 7+** for caching, queues, pub/sub
 - **JWT (HS256)** with bcrypt password hashing
 - **WebSockets** for real-time battles
 
 ---
 
 ## 3. API Base Configuration
 
 ### Frontend API Client Location
 ```
 src/services/apiClient.ts
 ```
 
 ### Configuration
 ```typescript
 // Environment variable (set in .env or hosting platform)
 VITE_API_URL=http://localhost:8000
 
 // Default fallback
 const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
 ```
 
 ### Request Format
 All requests include:
 ```typescript
 headers: {
   'Content-Type': 'application/json',
   'Authorization': 'Bearer <access_token>'  // When authenticated
 }
 ```
 
 ### Response Format (MUST FOLLOW)
 
 **Success Response:**
 ```json
 {
   "success": true,
   "data": { /* payload */ },
   "message": "Optional human-readable message"
 }
 ```
 
 **Error Response:**
 ```json
 {
   "success": false,
   "error": {
     "code": "ERROR_CODE",
     "message": "Human readable message",
     "details": { /* optional context */ }
   }
 }
 ```
 
 **⚠️ CRITICAL**: Frontend expects `response.data.data` for all successful responses!
 
 ---
 
 ## 4. Authentication Flow
 
 ### Token Storage
 - Access token stored in `localStorage` with key: `access_token`
 - Frontend automatically attaches token to all requests via axios interceptor
 
 ### Auth Context Location
 ```
 src/contexts/AuthContext.tsx
 ```
 
 ### Flow Diagram
 ```
 ┌─────────┐     POST /auth/signup      ┌─────────┐
 │  User   │  ─────────────────────────▶│ Backend │
 │         │  {username, email, pass}   │         │
 │         │◀───────────────────────────│         │
 └─────────┘  {access_token, user}      └─────────┘
      │
      │ Store token in localStorage
      ▼
 ┌─────────┐     GET /users/me          ┌─────────┐
 │  User   │  ─────────────────────────▶│ Backend │
 │         │  Authorization: Bearer xxx  │         │
 │         │◀───────────────────────────│         │
 └─────────┘  {user data}               └─────────┘
 ```
 
 ---
 
 ## 5. API Endpoints Reference
 
 ### 5.1 Authentication (`/api/v1/auth`)
 
 #### POST `/api/v1/auth/signup`
 Create a new user account.
 
 **Request:**
 ```json
 {
   "username": "string (3-50 chars, unique)",
   "email": "string (valid email, unique)",
   "password": "string (min 8 chars)"
 }
 ```
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "access_token": "jwt_token_string",
     "user": {
       "id": 1,
       "username": "player1",
       "email": "player1@example.com",
       "rating": 1000
     }
   }
 }
 ```
 
 **Frontend Usage:** `src/contexts/AuthContext.tsx` → `signup()`
 
 ---
 
 #### POST `/api/v1/auth/login`
 Authenticate existing user.
 
 **Request:**
 ```json
 {
   "email": "string",
   "password": "string"
 }
 ```
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "access_token": "jwt_token_string",
     "user": {
       "id": 1,
       "username": "player1",
       "email": "player1@example.com",
       "rating": 1420
     }
   }
 }
 ```
 
 **Frontend Usage:** `src/contexts/AuthContext.tsx` → `login()`
 
 ---
 
 ### 5.2 Users (`/api/v1/users`)
 
 #### GET `/api/v1/users/me`
 Get current authenticated user profile.
 
 **Headers:** `Authorization: Bearer <token>` (required)
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "id": 1,
     "username": "player1",
     "email": "player1@example.com",
     "rating": 1420,
     "battles_won": 15,
     "battles_lost": 8,
     "win_streak": 3,
     "avatar_url": "https://...",
     "created_at": "2024-01-15T10:30:00Z"
   }
 }
 ```
 
 **Frontend Usage:** 
 - `src/contexts/AuthContext.tsx` → on token load
 - `src/pages/Dashboard.tsx` → user stats display
 - `src/pages/Profile.tsx` → profile header
 - `src/pages/Settings.tsx` → account settings
 
 ---
 
 #### GET `/api/v1/users/me/stats`
 Get detailed statistics for current user.
 
 **Headers:** `Authorization: Bearer <token>` (required)
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "rating": 1847,
     "rating_history": [
       { "date": "2024-01-01", "rating": 1500 },
       { "date": "2024-02-01", "rating": 1720 }
     ],
     "battles_won": 42,
     "battles_lost": 18,
     "win_streak": 5,
     "best_streak": 12,
     "total_problems_solved": 87,
     "rank_global": 234,
     "algorithms_created": 5,
     "algorithms_alive": 2,
     "algorithms_dead": 3,
     "joined_at": "2024-01-01T00:00:00Z"
   }
 }
 ```
 
 **Frontend Usage:** `src/pages/Profile.tsx`
 
 ---
 
 #### GET `/api/v1/users/me/battles`
 Get user's recent battle history.
 
 **Query Parameters:**
 | Param | Type | Description |
 |-------|------|-------------|
 | `limit` | int | Number of battles (default: 10) |
 
 **Response:**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": 1,
       "opponent": "CodeSamurai",
       "result": "win",
       "elo_change": 24,
       "problem": "Two Sum",
       "date": "2024-02-01T10:30:00Z"
     }
   ]
 }
 ```
 
 **Frontend Usage:** `src/pages/Profile.tsx` → recent battles
 
 ---
 
 #### GET `/api/v1/users/me/achievements`
 Get user's achievement progress.
 
 **Response:**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": "first_blood",
       "name": "First Blood",
       "description": "Win your first battle",
       "icon": "⚔️",
       "unlocked": true
     },
     {
       "id": "centurion",
       "name": "Centurion",
       "description": "Win 100 battles",
       "icon": "🏆",
       "unlocked": false,
       "progress": 42,
       "total": 100
     }
   ]
 }
 ```
 
 **Frontend Usage:** `src/pages/Profile.tsx` → achievements section
 
 ---
 
 #### PUT `/api/v1/users/me`
 Update current user's profile.
 
 **Request:**
 ```json
 {
   "username": "new_username",
   "bio": "Algorithm enthusiast"
 }
 ```
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "id": 1,
     "username": "new_username",
     "bio": "Algorithm enthusiast"
   }
 }
 ```
 
 **Frontend Usage:** `src/pages/Settings.tsx` → account tab
 
 ---
 
 #### PUT `/api/v1/users/me/password`
 Change current user's password.
 
 **Request:**
 ```json
 {
   "current_password": "old_password",
   "new_password": "new_password"
 }
 ```
 
 **Response:**
 ```json
 {
   "success": true,
   "data": { "updated": true }
 }
 ```
 
 **Frontend Usage:** `src/pages/Settings.tsx` → security section
 
 ---
 
 ### 5.3 Problems/Challenges (`/api/v1/problems`)
 
 #### GET `/api/v1/problems`
 List all available coding problems.
 
 **Query Parameters:**
 | Param | Type | Description |
 |-------|------|-------------|
 | `difficulty` | string | Filter by: `easy`, `medium`, `hard` |
 | `tag` | string | Filter by tag (e.g., `arrays`, `dp`) |
 | `page` | int | Page number (default: 1) |
 | `page_size` | int | Items per page (default: 20) |
 
 **Response:**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": 1,
       "title": "Two Sum",
       "slug": "two-sum",
       "difficulty": "easy",
       "tags": ["arrays", "hash-table"],
       "acceptance_rate": 0.67,
       "solved_count": 1234
     }
   ]
 }
 ```
 
 **Frontend Usage:** `src/pages/ProblemsList.tsx`
 
 ---
 
 #### GET `/api/v1/problems/{id}`
 Get detailed problem by ID.
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "id": 1,
     "title": "Two Sum",
     "slug": "two-sum",
     "description": "Given an array of integers nums and an integer target...",
     "difficulty": "easy",
     "tags": ["arrays", "hash-table"],
     "examples": [
       {
         "input": "nums = [2,7,11,15], target = 9",
         "output": "[0,1]",
         "explanation": "Because nums[0] + nums[1] == 9"
       }
     ],
     "constraints": [
       "2 <= nums.length <= 10^4",
       "-10^9 <= nums[i] <= 10^9"
     ],
     "starter_code": {
       "python": "def two_sum(nums, target):\n    pass",
       "javascript": "function twoSum(nums, target) {\n    \n}"
     }
   }
 }
 ```
 
 **Frontend Usage:** `src/pages/ProblemDetail.tsx`
 
 ---
 
 ### 5.4 Algorithms (`/api/v1/algorithms`)
 
 #### GET `/api/v1/algorithms`
 List current user's algorithm organisms.
 
 **Headers:** `Authorization: Bearer <token>` (required)
 
 **Response:**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": 1,
       "name": "Binary Beast",
       "user_id": 1,
       "battles_won": 12,
       "battles_lost": 3,
       "rating": 1380,
       "traits": [
         {
           "id": "cache_warrior",
           "name": "Cache Warrior",
           "description": "Boosted performance on repeated inputs",
           "rarity": "rare"
         }
       ],
       "is_alive": true,
       "death_count": 1,
       "generation": 1,
       "created_at": "2024-01-10T08:00:00Z"
     }
   ]
 }
 ```
 
 **Frontend Usage:** `src/pages/Dashboard.tsx` → algorithms section
 
 ---
 
 #### POST `/api/v1/algorithms`
 Create a new algorithm organism.
 
 **Request:**
 ```json
 {
   "name": "My Algorithm",
   "code": "def solution(arr):\n    return sorted(arr)",
   "language": "python"
 }
 ```
 
 **Validation Rules:**
 - `language` must be: `python`, `javascript`, or `rust`
 - `code` length: 10-10000 characters
 - Forbidden imports: `os`, `sys`, `subprocess`, `socket`
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "id": 2,
     "name": "My Algorithm",
     "is_alive": true,
     "death_count": 0,
     "generation": 1
   }
 }
 ```
 
 ---
 
 ### 5.5 Matchmaking (`/api/v1/matchmaking`)
 
 #### POST `/api/v1/matchmaking/queue/join`
 Join the matchmaking queue for a battle.
 
 **Request:**
 ```json
 {
   "mode": "ranked_1v1",
   "difficulty": "medium",
   "language": "python",
   "algorithm_id": 1
 }
 ```
 
 **Validation:**
 - Algorithm must belong to user
 - Algorithm must be alive (`is_alive: true`)
 - Algorithm `death_count` must be < 3
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "position": 3,
     "size": 12,
     "estimated_wait": 30
   }
 }
 ```
 
 **Frontend Usage:** `src/pages/Dashboard.tsx` → Quick Match button
 
 ---
 
 #### POST `/api/v1/matchmaking/queue/leave`
 Leave the matchmaking queue.
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "removed": true
   }
 }
 ```
 
 ---
 
 #### GET `/api/v1/matchmaking/status`
 Poll for match status (alternative to WebSocket).
 
 **Response (in queue):**
 ```json
 {
   "success": true,
   "data": {
     "status": "queued",
     "position": 2,
     "size": 10
   }
 }
 ```
 
 **Response (match found):**
 ```json
 {
   "success": true,
   "data": {
     "status": "matched",
     "battle_id": 123
   }
 }
 ```
 
 ---
 
 ### 5.6 Battles (`/api/v1/battles`)
 
 #### GET `/api/v1/battles`
 List user's battle history.
 
 **Query Parameters:**
 | Param | Type | Description |
 |-------|------|-------------|
 | `status` | string | Filter: `completed`, `in_progress` |
 | `result` | string | Filter: `won`, `lost`, `draw` |
 | `page` | int | Page number |
 
 **Response:**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": 123,
       "problem_id": 1,
       "problem": { "id": 1, "title": "Two Sum" },
       "player1_id": 1,
       "player2_id": 2,
       "player1": { "id": 1, "username": "player1", "rating": 1420 },
       "player2": { "id": 2, "username": "player2", "rating": 1380 },
       "winner_id": 1,
       "status": "completed",
       "player1_score": 10,
       "player2_score": 7,
       "player1_elo_change": 24,
       "player2_elo_change": -12,
       "duration_seconds": 1200,
       "started_at": "2024-01-15T10:00:00Z",
       "ended_at": "2024-01-15T10:20:00Z"
     }
   ]
 }
 ```
 
 ---
 
 #### GET `/api/v1/battles/{id}`
 Get detailed battle result.
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "id": 123,
     "winner_id": 1,
     "player1": { "id": 1, "username": "player1", "rating": 1420 },
     "player2": { "id": 2, "username": "player2", "rating": 1380 },
     "problem": { "id": 1, "title": "Two Sum" },
     "duration_seconds": 1200,
     "player1_score": 10,
     "player2_score": 7,
     "player1_submission": {
       "code": "...",
       "language": "python",
       "runtime_ms": 45,
       "memory_kb": 14200
     },
     "player2_submission": {
       "code": "...",
       "language": "javascript",
       "runtime_ms": 52,
       "memory_kb": 15800
     }
   }
 }
 ```
 
 **Frontend Usage:** `src/pages/BattleResults.tsx`
 
 ---
 
 ### 5.7 Submissions (`/api/v1/submissions`)
 
 #### POST `/api/v1/submissions`
 Submit code for evaluation (practice mode).
 
 **Request:**
 ```json
 {
   "problem_id": 1,
   "code": "def two_sum(nums, target):\n    ...",
   "language": "python"
 }
 ```
 
 **Response (immediate):**
 ```json
 {
   "success": true,
   "data": {
     "id": 456,
     "status": "pending"
   }
 }
 ```
 
 **Response (after execution, via polling or WebSocket):**
 ```json
 {
   "success": true,
   "data": {
     "id": 456,
     "status": "accepted",
     "passed": 10,
     "total": 10,
     "runtime_ms": 45,
     "memory_kb": 14200
   }
 }
 ```
 
 **Frontend Usage:** `src/pages/ProblemDetail.tsx` → Submit button
 
 ---
 
 #### POST `/api/v1/submissions/run`
 Run code against sample test cases only (quick feedback).
 
 **Request:**
 ```json
 {
   "problem_id": 1,
   "code": "def two_sum(nums, target):\n    ...",
   "language": "python"
 }
 ```
 
 **Response:**
 ```json
 {
   "success": true,
   "data": {
     "passed": 2,
     "total": 3,
     "test_results": [
       { "passed": true, "runtime_ms": 10 },
       { "passed": true, "runtime_ms": 12 },
       { "passed": false, "expected": "[0,1]", "actual": "[1,0]" }
     ]
   }
 }
 ```
 
 **Frontend Usage:** `src/pages/ProblemDetail.tsx` → Run button
 
 ---
 
 ### 5.8 Leaderboard (`/api/v1/leaderboard`)
 
 #### GET `/api/v1/leaderboard`
 Get global leaderboard.
 
 **Query Parameters:**
 | Param | Type | Description |
 |-------|------|-------------|
 | `type` | string | `global`, `weekly`, `algorithms` |
 | `limit` | int | Number of entries (default: 50) |
 
 **Response:**
 ```json
 {
   "success": true,
   "data": [
     {
       "rank": 1,
       "user": {
         "id": 5,
         "username": "champion",
         "avatar_url": "...",
         "rating": 2150
       },
       "rating": 2150,
       "wins": 156,
       "losses": 23,
       "win_rate": 0.87,
       "streak": 12
     }
   ]
 }
 ```
 
 **Frontend Usage:** `src/pages/Leaderboard.tsx`
 
 ---
 
 ## 6. WebSocket Integration
 
 ### Connection URL
 ```
 ws://localhost:8000/ws/battles/{battle_id}
 ```
 
 ### Authentication
 Pass JWT token as query parameter or in first message:
 ```
 ws://localhost:8000/ws/battles/123?token=<jwt_token>
 ```
 
 ### Message Types (Server → Client)
 
 #### Battle Start
 ```json
 {
   "type": "battle_start",
   "data": {
     "battle_id": 123,
     "problem": { "id": 1, "title": "Two Sum" },
     "opponent": { "id": 2, "username": "opponent" },
     "time_limit_seconds": 1800
   },
   "timestamp": 1705312800000
 }
 ```
 
 #### Battle Update (Tick)
 ```json
 {
   "type": "battle_update",
   "data": {
     "timer_remaining_seconds": 672.5,
     "players": {
       "1": { "tests_passed": 5, "submitted": false },
       "2": { "tests_passed": 3, "submitted": false }
     }
   },
   "timestamp": 1705312850000
 }
 ```
 
 #### Opponent Progress
 ```json
 {
   "type": "opponent_progress",
   "data": {
     "tests_passed": 7,
     "is_typing": true
   },
   "timestamp": 1705312860000
 }
 ```
 
 #### Test Result
 ```json
 {
   "type": "test_result",
   "data": {
     "submission_id": 456,
     "passed": 8,
     "total": 10,
     "status": "running"
   },
   "timestamp": 1705312870000
 }
 ```
 
 #### Battle End
 ```json
 {
   "type": "battle_end",
   "data": {
     "winner_id": 1,
     "player1_score": 10,
     "player2_score": 7,
     "elo_change": 24
   },
   "timestamp": 1705313800000
 }
 ```
 
 ### Message Types (Client → Server)
 
 #### Code Update
 ```json
 {
   "type": "CODE_UPDATE",
   "data": {
     "code": "def solution..."
   }
 }
 ```
 
 #### Run Tests
 ```json
 {
   "type": "RUN_TESTS",
   "data": {
     "code": "def solution...",
     "language": "python"
   }
 }
 ```
 
 #### Submit Solution
 ```json
 {
   "type": "SUBMIT",
   "data": {
     "code": "def solution...",
     "language": "python"
   }
 }
 ```
 
 ### Frontend WebSocket Hook
 ```
 src/hooks/useWebSocket.ts
 ```
 
 Features:
 - Auto-reconnection with exponential backoff
 - Connection state tracking
 - Message queue for offline messages
 
 ---
 
 ## 7. Data Types & Schemas
 
 ### TypeScript Types Location
 ```
 src/types/index.ts
 ```
 
 ### Key Types
 
 ```typescript
 // User
 interface User {
   id: number
   username: string
   email: string
   rating: number
   battles_won?: number
   battles_lost?: number
   win_streak?: number
   avatar_url?: string
   created_at?: string
 }
 
 // Problem
 interface Problem {
   id: number
   title: string
   slug: string
   description: string
   difficulty: 'easy' | 'medium' | 'hard'
   tags: string[]
   examples?: ProblemExample[]
   constraints?: string[]
   starter_code?: Record<string, string>
 }
 
 // Algorithm (Organism)
 interface Algorithm {
   id: number
   name: string
   user_id: number
   battles_won: number
   battles_lost: number
   rating: number
   traits?: AlgorithmTrait[]
   is_alive: boolean
   death_count: number
   generation: number
   created_at?: string
 }
 
 // Battle
 interface Battle {
   id: number
   problem_id: number
   problem?: Problem
   player1_id: number
   player2_id: number
   player1?: User
   player2?: User
   winner_id?: number
   status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
   player1_score?: number
   player2_score?: number
   player1_elo_change?: number
   player2_elo_change?: number
   duration_seconds?: number
 }
 
 // Submission
 interface Submission {
   id: number
   problem_id: number
   user_id: number
   battle_id?: number
   code: string
   language: string
   status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error'
   runtime_ms?: number
   memory_kb?: number
   test_cases_passed?: number
   test_cases_total?: number
 }
 
 // Leaderboard Entry
 interface LeaderboardEntry {
   rank: number
   user: User
   rating: number
   wins: number
   losses: number
   win_rate: number
   streak: number
 }
 ```
 
 ---
 
 ## 8. Frontend Pages & Their API Dependencies
 
 | Page | Route | Required APIs |
 |------|-------|---------------|
 | Landing | `/` | None (static) |
 | Login | `/login` | `POST /auth/login` |
 | Signup | `/signup` | `POST /auth/signup` |
 | Dashboard | `/dashboard` | `GET /users/me`, `GET /algorithms` |
 | Problems List | `/problems` | `GET /problems` |
 | Problem Detail | `/problems/:id` | `GET /problems/:id`, `POST /submissions`, `POST /submissions/run` |
 | Battle Results | `/battles/:id` | `GET /battles/:id` |
 | Leaderboard | `/leaderboard` | `GET /leaderboard` |
 | Algorithms Lab | `/algorithms` | `GET /algorithms`, `POST /algorithms`, `DELETE /algorithms/:id` |
 | Battle Arena | `/arena` | `GET /algorithms`, `POST /matchmaking/queue/join`, `POST /matchmaking/queue/leave` |
 | Profile | `/profile` | `GET /users/me/stats`, `GET /users/me/battles`, `GET /users/me/achievements` |
 | Settings | `/settings` | `GET /users/me`, `PUT /users/me`, `PUT /users/me/password` |
 
 ### Page-by-Page Implementation Checklist
 
 #### ✅ Landing Page (`/`)
 - Static content, no API calls
 - CTA buttons redirect to `/login` or `/dashboard`
 
 #### ✅ Login (`/login`)
 - Calls `POST /api/v1/auth/login`
 - Stores token in localStorage
 - Redirects to `/dashboard`
 
 #### ✅ Signup (`/signup`)
 - Calls `POST /api/v1/auth/signup`
 - Stores token in localStorage
 - Redirects to `/dashboard`
 
 #### ✅ Dashboard (`/dashboard`)
 - Calls `GET /api/v1/users/me` for stats
 - Calls `GET /api/v1/algorithms` for algorithm list
 - Quick Match calls `POST /api/v1/matchmaking/queue/join`
 
 #### ✅ Problems List (`/problems`)
 - Calls `GET /api/v1/problems` with filters
 - Client-side search/filter applied
 
 #### ✅ Problem Detail (`/problems/:id`)
 - Calls `GET /api/v1/problems/:id`
 - Run button calls `POST /api/v1/submissions/run`
 - Submit button calls `POST /api/v1/submissions`
 
 #### ✅ Battle Results (`/battles/:id`)
 - Calls `GET /api/v1/battles/:id`
 - Displays winner, scores, ELO changes
 
 #### ✅ Leaderboard (`/leaderboard`)
 - Calls `GET /api/v1/leaderboard`
 - Tabs for Global, Weekly, Algorithms
 
 #### ✅ Algorithms Lab (`/algorithms`)
 - Calls `GET /api/v1/algorithms` for organism list with full stats
 - Create modal calls `POST /api/v1/algorithms`
 - Displays organism details: stats, traits, death_count, generation
 - Shows alive vs dead organisms separately
 
 #### ✅ Battle Arena (`/arena`)
 - Calls `GET /api/v1/algorithms` for algorithm selection
 - Mode selection: ranked_1v1, casual, practice
 - Difficulty selection: easy, medium, hard, expert
 - Find Match calls `POST /api/v1/matchmaking/queue/join`
 - Cancel calls `POST /api/v1/matchmaking/queue/leave`
 - Shows live queue status and opponent found animation
 
 #### ✅ Profile (`/profile`)
 - Calls `GET /api/v1/users/me/stats` for detailed statistics
 - Calls `GET /api/v1/users/me/battles?limit=5` for recent battles
 - Calls `GET /api/v1/users/me/achievements` for achievement list
 - Shows ELO rating, win rate, best streak, problems solved
 - Displays recent battle history with ELO changes
 
 #### ✅ Settings (`/settings`)
 - Account tab: username, email, bio editing
 - Preferences tab: theme, sound, language
 - Editor tab: default language, font size, editor theme
 - Notifications tab: email, battle invites, leaderboard updates
 - Privacy tab: profile visibility, battle history visibility
 - Calls `PUT /api/v1/users/me` to save profile changes
 - Calls `PUT /api/v1/users/me/password` for password change
 
 ---
 
 ## 9. Error Handling
 
 ### Error Codes
 
 | Code | HTTP Status | Description |
 |------|-------------|-------------|
 | `AUTH_REQUIRED` | 401 | Missing or invalid token |
 | `AUTH_EXPIRED` | 401 | Token expired |
 | `FORBIDDEN` | 403 | Insufficient permissions |
 | `NOT_FOUND` | 404 | Resource not found |
 | `VALIDATION_ERROR` | 422 | Invalid input data |
 | `DUPLICATE_ENTRY` | 409 | Username/email already exists |
 | `ALGORITHM_DEAD` | 400 | Algorithm has permadeath |
 | `QUEUE_FULL` | 503 | Matchmaking queue at capacity |
 | `RATE_LIMITED` | 429 | Too many requests |
 | `INTERNAL_ERROR` | 500 | Server error |
 
 ### Frontend Error Handling
 
 The API client (`src/lib/api.ts`) includes:
 - Automatic retry with exponential backoff
 - 401 → redirect to login
 - Toast notifications for user-facing errors
 
 ---
 
 ## 10. Real-time Features
 
 ### Matchmaking Flow
 
 ```
 1. User clicks "Quick Match"
 2. POST /matchmaking/queue/join → returns queue position
 3. Frontend shows "Finding opponent..." UI
 4. Option A: Poll GET /matchmaking/status every 2s
    Option B: Listen to WebSocket for match notification
 5. When match found → redirect to /battles/:id
 6. Connect WebSocket to /ws/battles/:id
 7. Battle begins with synchronized timer
 ```
 
 ### Battle Flow
 
 ```
 1. Both players connect to WebSocket
 2. Server sends battle_start with problem details
 3. Timer starts (15-30 min configurable)
 4. Players code in Monaco editor
 5. "Run" → POST /submissions/run → show sample test results
 6. "Submit" → send SUBMIT via WebSocket
 7. Server evaluates against full test suite
 8. First to submit + higher score wins
 9. Server sends battle_end with results
 10. Redirect to /battles/:id for results page
 ```
 
 ---
 
 ## 11. Testing the Integration
 
 ### Required Seed Data
 
 For the frontend to work, seed the database with:
 
 ```sql
 -- Users
 INSERT INTO users (username, email, password_hash, rating) VALUES
 ('player1', 'player1@test.com', '<bcrypt_hash>', 1420),
 ('player2', 'player2@test.com', '<bcrypt_hash>', 1380);
 
 -- Problems
 INSERT INTO problems (title, description, difficulty, test_cases) VALUES
 ('Two Sum', 'Given an array...', 'easy', '[{"input": [2,7,11,15], "target": 9, "output": [0,1]}]'),
 ('Reverse Linked List', 'Reverse a singly...', 'medium', '[...]');
 
 -- Algorithms (optional, users can create)
 INSERT INTO algorithms (user_id, name, code, language, is_alive) VALUES
 (1, 'Binary Beast', 'def solution()...', 'python', true);
 ```
 
 ### Health Check
 
 Verify backend is running:
 ```bash
 curl http://localhost:8000/health
 # Expected: {"status": "healthy"}
 ```
 
 ### Test Authentication
 
 ```bash
 # Signup
 curl -X POST http://localhost:8000/api/v1/auth/signup \
   -H "Content-Type: application/json" \
   -d '{"username":"test","email":"test@test.com","password":"password123"}'
 
 # Login
 curl -X POST http://localhost:8000/api/v1/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"test@test.com","password":"password123"}'
 ```
 
 ### Test Protected Route
 
 ```bash
 curl http://localhost:8000/api/v1/users/me \
   -H "Authorization: Bearer <token_from_login>"
 ```
 
 ---
 
 ## CORS Configuration
 
 Backend must allow:
 
 ```python
 from fastapi.middleware.cors import CORSMiddleware
 
 app.add_middleware(
     CORSMiddleware,
     allow_origins=["http://localhost:5173", "http://localhost:8080", "https://your-domain.com"],
     allow_credentials=True,
     allow_methods=["*"],
     allow_headers=["*"],
 )
 ```
 
 ---
 
 ## Quick Reference Card
 
 | Feature | Endpoint | Method |
 |---------|----------|--------|
 | Signup | `/api/v1/auth/signup` | POST |
 | Login | `/api/v1/auth/login` | POST |
 | Current User | `/api/v1/users/me` | GET |
 | List Problems | `/api/v1/problems` | GET |
 | Get Problem | `/api/v1/problems/:id` | GET |
 | List Algorithms | `/api/v1/algorithms` | GET |
 | Create Algorithm | `/api/v1/algorithms` | POST |
 | Join Queue | `/api/v1/matchmaking/queue/join` | POST |
 | Leave Queue | `/api/v1/matchmaking/queue/leave` | POST |
 | Queue Status | `/api/v1/matchmaking/status` | GET |
 | List Battles | `/api/v1/battles` | GET |
 | Get Battle | `/api/v1/battles/:id` | GET |
 | Run Code | `/api/v1/submissions/run` | POST |
 | Submit Code | `/api/v1/submissions` | POST |
 | Leaderboard | `/api/v1/leaderboard` | GET |
 | Battle WS | `/ws/battles/:id` | WebSocket |
 
 ---
 
 **Document Version:** 1.0  
 **Last Updated:** February 2026  
 **Frontend Version:** Production-ready