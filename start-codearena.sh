#!/bin/bash
# CodeArena - Complete Startup Script
# Starts all infrastructure and services in correct order

set -e  # Exit on error

echo "🚀 CodeArena Startup Script"
echo "=" "=="================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    echo -n "⏳ Waiting for $service on port $port..."
    while ! nc -z localhost $port 2>/dev/null; do
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED} TIMEOUT${NC}"
            return 1
        fi
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    echo -e "${GREEN} READY${NC}"
    return 0
}

# Check prerequisites
echo ""
echo "📋 Checking Prerequisites..."
echo "================================"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker installed$(NC}"
echo -e "${GREEN}✅ Node.js installed${NC}"

# Step 1: Start Docker Infrastructure
echo ""
echo "🐳 Starting Docker Infrastructure..."
echo "================================"

echo "Starting PostgreSQL..."
docker start codebattle-postgres
wait_for_service "PostgreSQL" 5432 || exit 1

echo "Starting Redis..."
docker start codebattle-redis
wait_for_service "Redis" 6380 || exit 1

echo "Starting RabbitMQ..."
docker start codebattle-rabbitmq
wait_for_service "RabbitMQ" 5672 || exit 1

echo -e "${GREEN}✅ All infrastructure services running${NC}"

# Verify database connectivity
echo ""
echo "🔍 Verifying Database..."
echo "================================"

if docker exec codebattle-postgres psql -U postgres -d codebattle -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL connection verified${NC}"
    
    # Count tables
    user_count=$(docker exec codebattle-postgres psql -U postgres -d codebattle -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
    problem_count=$(docker exec codebattle-postgres psql -U postgres -d codebattle -t -c "SELECT COUNT(*) FROM problems;" 2>/dev/null | tr -d ' ')
    
    echo "📊 Database Stats:"
    echo "   Users: $user_count"
    echo "   Problems: $problem_count"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

# Verify Redis
echo ""
echo "🔍 Verifying Redis..."
if docker exec codebattle-redis redis-cli PING | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis connection verified${NC}"
else
    echo -e "${RED}❌ Redis connection failed${NC}"
    exit 1
fi

# Step 2: Service Startup Instructions
echo ""
echo "🎯 Infrastructure Ready! Now start services..."
echo "================================"
echo ""
echo -e "${YELLOW}⚠️  You need to start services in separate terminals:${NC}"
echo ""
echo "Terminal 1 - Auth Service:"
echo "  cd backend/services/auth-service && npm run dev"
echo ""
echo "Terminal 2 - Battle Service:"
echo "  cd backend/services/battle-service && npm run dev"
echo ""
echo "Terminal 3 - WebSocket Server:"
echo "  cd backend/services/websocket-server && npm run dev"
echo ""
echo "Terminal 4 - Execution Service:"
echo "  cd backend/services/execution-service && npm run dev"
echo ""
echo "Terminal 5 - Rating Service:"
echo "  cd backend/services/rating-service && npm run dev"
echo ""
echo "Terminal 6 - Frontend:"
echo "  npm run dev"
echo ""
echo "================================"
echo ""
echo "📚 Service Health Checks:"
echo "  Auth:      curl http://localhost:3001/health"
echo "  Battle:    curl http://localhost:3002/health"
echo "  Execution: curl http://localhost:3003/health"
echo "  Rating:    curl http://localhost:3004/health"
echo "  Frontend:  http://localhost:5173"
echo ""
echo "🎬 RabbitMQ Management UI: http://localhost:15672 (guest/guest)"
echo ""
echo -e "${GREEN}✅ Startup script complete!${NC}"
