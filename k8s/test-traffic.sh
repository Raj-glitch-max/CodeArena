#!/bin/bash

echo "🚀 Generating traffic for CodeArena..."
BASE_URL="http://localhost:3006"

# Function to simulate requests
generate_traffic() {
    # Auth Service - Health
    curl -s "$BASE_URL/api/auth/health" > /dev/null
    
    # Auth Service - Login (Simulated fail)
    curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
    
    # Battle Service - Health
    curl -s "$BASE_URL/api/battle/health" > /dev/null
    
    # Execution Service - Health
    curl -s "$BASE_URL/api/execution/health" > /dev/null
    
    echo -n "."
}

echo "Press [CTRL+C] to stop."
while true; do
    generate_traffic
    sleep 1
done
