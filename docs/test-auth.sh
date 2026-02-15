#!/bin/bash
# Test Auth Service Registration

echo "🧪 Testing Auth Service - User Registration"
echo "============================================"
echo ""

# Test 1: Register a new user
echo "📝 Test 1: Register new user"
echo "Command: curl -X POST http://localhost:3001/api/auth/register"
echo ""

curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "test1@codearena.com",
    "password": "SecurePass123!"
  }'

echo ""
echo ""

# Test 2: Login with that user
echo "🔐 Test 2: Login with the user"
echo "Command: curl -X POST http://localhost:3001/api/auth/login"
echo ""

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "password": "SecurePass123!"
  }'

echo ""
echo ""

# Test 3: Try to register same user again (should fail)
echo "❌ Test 3: Try duplicate username (should fail)"
echo ""

curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "different@codearena.com",
    "password": "AnotherPass456!"
  }'

echo ""
echo ""
echo "============================================"
echo "✅ Tests complete. Analyze the responses above."
