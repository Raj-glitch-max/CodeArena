# CodeArena ⚔️
> Real-time 1v1 Competitive Coding Platform

CodeArena is a modern, high-performance platform where developers compete against each other to solve algorithmic challenges in real-time. Featuring a robust microservices architecture, live execution environment, and an ELO-based rating system.

## 🚀 Features

- **1v1 Battles**: Real-time matchmaking and code synchronization with opponents.
- **Live Execution**: Secure, sandboxed code execution (JavaScript, Python, Java, C++) powered by Docker.
- **Rating System**: Dynamic ELO system that adjusts player ranks (Bronze to Grandmaster) based on performance.
- **Interactive Editor**: Monaco-based editor with syntax highlighting, auto-completion, and multiple language support.
- **Real-time Updates**: WebSocket-driven UI for live battle status, test case results, and opponent progress.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Build Tool**: Vite
- **State Management**: React Query + Context API

### Backend Microservices
- **API Gateway/Services**: Node.js + Express
- **Communication**: REST + WebSockets (Socket.io)
- **Message Queue**: RabbitMQ (for async code execution)
- **Database**: PostgreSQL (Primary Data) + Redis (Caching & Leaderboards)
- **ORM**: Prisma

## 🏗️ Architecture

The platform is built on a scalable microservices architecture:
1.  **Auth Service**: Handles user authentication and JWT management.
2.  **Battle Service**: Manages battle lifecycles, problem distribution, and state.
3.  **Execution Service**: secure code execution worker that runs user submissions against test cases.
4.  **Rating Service**: Calculates ELO changes and updates leaderboards.
5.  **WebSocket Server**: Orchestrates real-time events between clients and services.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL & Redis (or use Docker)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Raj-glitch-max/CodeArena.git
    cd CodeArena
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    cd backend && npm install
    ```

3.  **Start Infrastructure**
    ```bash
    cd backend/docker
    docker-compose up -d
    ```

4.  **Run Development Servers**
    ```bash
    # Root (Frontend)
    npm run dev

    # Backend
    cd backend && npm run dev
    ```

## 🛡️ License

This project is proprietary software. All rights reserved.
