#!/bin/bash
# CodeArena MVP - BRUTAL CLI TEST SUITE
# No mercy. Every endpoint. Every edge case. Raw truth.

set -e
BASE_URL="http://localhost:9000"
RESULTS_FILE="/tmp/brutal_test_results.txt"
FAILED_TESTS=0
PASSED_TESTS=0

echo "💀 BRUTAL CLI TEST SUITE - CodeArena MVP" > $RESULTS_FILE
echo "=========================================" >> $RESULTS_FILE
echo "Started: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name="$1"
    local expected_code="$2"
    local actual_code="$3"
    local response="$4"
    
    if [ "$expected_code" == "$actual_code" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name"
        echo "✅ PASS: $name" >> $RESULTS_FILE
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $name (Expected: $expected_code, Got: $actual_code)"
        echo "❌ FAIL: $name" >> $RESULTS_FILE
        echo "  Expected: $expected_code, Got: $actual_code" >> $RESULTS_FILE
        echo "  Response: $response" >> $RESULTS_FILE
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 1: BACKEND CONNECTIVITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Server is reachable
echo "🔍 Test 1: Server Reachability..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health.json $BASE_URL/health 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Health endpoint" "200" "$HTTP_CODE" "$(cat /tmp/health.json)"

# Test 2: Health check returns correct format
echo "🔍 Test 2: Health Check Format..."
if [ "$HTTP_CODE" == "200" ]; then
    IS_SUCCESS=$(cat /tmp/health.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
    if [ "$IS_SUCCESS" == "True" ]; then
        test_endpoint "Health format has 'success' field" "True" "$IS_SUCCESS" ""
    else
        test_endpoint "Health format has 'success' field" "True" "False" "$(cat /tmp/health.json)"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 2: AUTH - BRUTAL EDGE CASE TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 3: Signup with valid data
echo "🔍 Test 3: Valid Signup..."
TIMESTAMP=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"brutal_test_$TIMESTAMP\",\"email\":\"brutal$TIMESTAMP@test.com\",\"password\":\"BrutalTest123!\"}" \
    -o /tmp/signup.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Signup with valid data" "201" "$HTTP_CODE" "$(cat /tmp/signup.json 2>/dev/null)"

# Test 4: Signup with DUPLICATE email (should fail)
echo "🔍 Test 4: Duplicate Email Rejection..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"another_user\",\"email\":\"brutal$TIMESTAMP@test.com\",\"password\":\"Test123!\"}" \
    -o /tmp/dup_email.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Duplicate email rejected" "400" "$HTTP_CODE" "$(cat /tmp/dup_email.json 2>/dev/null)"

# Test 5: Signup with MISSING required field
echo "🔍 Test 5: Missing Field Validation..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"test\",\"password\":\"Test123!\"}" \
    -o /tmp/missing_field.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Missing email field rejected" "422" "$HTTP_CODE" "$(cat /tmp/missing_field.json 2>/dev/null)"

# Test 6: Signup with INVALID email format
echo "🔍 Test 6: Invalid Email Format..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"test\",\"email\":\"notanemail\",\"password\":\"Test123!\"}" \
    -o /tmp/bad_email.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Invalid email format rejected" "422" "$HTTP_CODE" "$(cat /tmp/bad_email.json 2>/dev/null)"

# Test 7: Login with VALID credentials
echo "🔍 Test 7: Valid Login..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"dev@example.com","password":"password123"}' \
    -o /tmp/login.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Login with valid credentials" "200" "$HTTP_CODE" "$(cat /tmp/login.json 2>/dev/null)"

# Extract token for authenticated requests
if [ "$HTTP_CODE" == "200" ]; then
    TOKEN=$(cat /tmp/login.json | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null)
    echo "🔑 Token extracted: ${TOKEN:0:50}..."
else
    echo "❌ CRITICAL: Cannot extract token, authenticated tests will fail"
    TOKEN="invalid_token"
fi

# Test 8: Login with WRONG password
echo "🔍 Test 8: Wrong Password Rejection..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"dev@example.com","password":"wrongpassword123"}' \
    -o /tmp/wrong_pass.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Wrong password rejected" "401" "$HTTP_CODE" "$(cat /tmp/wrong_pass.json 2>/dev/null)"

# Test 9: Login with NON-EXISTENT email
echo "🔍 Test 9: Non-existent Email..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"doesnotexist@fake.com","password":"anything"}' \
    -o /tmp/no_user.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Non-existent email rejected" "401" "$HTTP_CODE" "$(cat /tmp/no_user.json 2>/dev/null)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 3: AUTHENTICATED ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 10: Get current user WITH token
echo "🔍 Test 10: Get Current User (Authenticated)..."
RESPONSE=$(curl -s -w "%{http_code}" $BASE_URL/api/v1/users/me \
    -H "Authorization: Bearer $TOKEN" \
    -o /tmp/me.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Get current user with token" "200" "$HTTP_CODE" "$(cat /tmp/me.json 2>/dev/null)"

# Test 11: Get current user WITHOUT token
echo "🔍 Test 11: Unauthenticated Request Block..."
RESPONSE=$(curl -s -w "%{http_code}" $BASE_URL/api/v1/users/me \
    -o /tmp/no_auth.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "No token blocked" "401" "$HTTP_CODE" "$(cat /tmp/no_auth.json 2>/dev/null)"

# Test 12: Get current user with INVALID token
echo "🔍 Test 12: Invalid Token Rejection..."
RESPONSE=$(curl -s -w "%{http_code}" $BASE_URL/api/v1/users/me \
    -H "Authorization: Bearer invalid_fake_token_12345" \
    -o /tmp/bad_token.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "Invalid token rejected" "401" "$HTTP_CODE" "$(cat /tmp/bad_token.json 2>/dev/null)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 4: PROBLEMS API - DATA VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 13: List all problems
echo "🔍 Test 13: List All Problems..."
RESPONSE=$(curl -s -w "%{http_code}" $BASE_URL/api/v1/problems \
    -o /tmp/problems.json 2>&1)
HTTP_CODE="${RESPONSE: -3}"
test_endpoint "List problems endpoint" "200" "$HTTP_CODE" ""

# Test 14: Verify problem count
echo "🔍 Test 14: Problem Count Validation..."
if [ "$HTTP_CODE" == "200" ]; then
    COUNT=$(cat /tmp/problems.json | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
    if [ "$COUNT" == "10" ]; then
        test_endpoint "10 problems seeded" "10" "$COUNT" ""
    else
        test_endpoint "10 problems seeded" "10" "$COUNT" "Only $COUNT problems found"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FINAL RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ PASSED: $PASSED_TESTS"
echo "❌ FAILED: $FAILED_TESTS"
echo "📊 TOTAL:  $((PASSED_TESTS + FAILED_TESTS))"
echo ""

if [[ $((PASSED_TESTS + FAILED_TESTS)) -gt 0 ]]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / (PASSED_TESTS + FAILED_TESTS)))
    echo "Success Rate: $SUCCESS_RATE%"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $RESULTS_FILE
echo "FINAL RESULTS" >> $RESULTS_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $RESULTS_FILE
echo "PASSED: $PASSED_TESTS" >> $RESULTS_FILE
echo "FAILED: $FAILED_TESTS" >> $RESULTS_FILE
echo "Completed: $(date)" >> $RESULTS_FILE

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED - MVP IS SOLID${NC}"
    echo "Full results: $RESULTS_FILE"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED - See details in $RESULTS_FILE${NC}"
    exit 1
fi
