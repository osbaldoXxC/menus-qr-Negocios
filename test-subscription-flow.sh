#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000/api"
ADMIN_EMAIL="admin@mexxican.mx"
ADMIN_PASS="Admin@12345"
TEST_EMAIL="test@restaurant.mx"
TEST_PASS="Test@12345"

echo -e "${YELLOW}=== Testing Subscription Flow ===${NC}\n"

# 1. Login as admin
echo -e "${YELLOW}1. Logging in as admin...${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.access_token // empty')
if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}✗ Admin login failed${NC}"
  echo $ADMIN_LOGIN | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Admin logged in${NC}\n"

# 2. Get restaurants list
echo -e "${YELLOW}2. Fetching restaurants list...${NC}"
RESTAURANTS=$(curl -s -X GET "$API_URL/admin/restaurants" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

PENDING_COUNT=$(echo $RESTAURANTS | jq '[.[] | select(.estado == "pendiente")] | length')
echo -e "${GREEN}✓ Found $PENDING_COUNT pending restaurants${NC}\n"

# 3. Show first pending restaurant
FIRST_PENDING=$(echo $RESTAURANTS | jq -r '.[] | select(.estado == "pendiente") | .id' | head -1)
if [ ! -z "$FIRST_PENDING" ]; then
  echo -e "${YELLOW}3. Testing suspension flow on: $FIRST_PENDING${NC}"

  # Suspend the restaurant
  SUSPEND=$(curl -s -X PUT "$API_URL/admin/restaurants/$FIRST_PENDING/suspend" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json")

  echo -e "${GREEN}✓ Suspension response:${NC}"
  echo $SUSPEND | jq '.'
else
  echo -e "${YELLOW}No pending restaurants to test suspension${NC}"
fi

echo -e "\n${GREEN}=== Test Complete ===${NC}"
