#!/bin/bash

# Discord Bot - Prerequisites Checker
# Verifies all dependencies and configurations before testing

echo "🔍 DISCORD BOT - PREREQUISITES CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check() {
  if eval "$1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $2"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $2"
    ((FAILED++))
  fi
}

# Node.js Check
check "node --version | grep -q v" "Node.js installed"
NODE_VERSION=$(node --version 2>/dev/null)
if [[ $NODE_VERSION =~ ^v1[89] ]] || [[ $NODE_VERSION =~ ^v[2-9][0-9] ]]; then
  echo -e "${GREEN}  → $NODE_VERSION${NC}"
else
  echo -e "${YELLOW}  → Warning: Expected Node 18+, got $NODE_VERSION${NC}"
fi

# npm Check
check "npm --version" "npm installed"

# .env File Check
check "test -f .env" ".env file exists"
if test -f .env; then
  check "grep -q 'GROQ_API_KEY_1' .env" "Groq API Key 1 configured"
  check "grep -q 'GROQ_API_KEY_2' .env" "Groq API Key 2 configured"
  check "grep -q 'GROQ_API_KEY_3' .env" "Groq API Key 3 configured"
  check "grep -q 'GROQ_API_KEY_4' .env" "Groq API Key 4 configured"
  check "grep -q 'MONGODB_URI' .env" "MongoDB URI configured"
  check "grep -q 'DISCORD_TOKEN' .env" "Discord token configured"
fi

# Source Files Check
check "test -f constants.js" "constants.js exists"
check "test -f services/groqService.js" "services/groqService.js exists"
check "test -f services/mongodbService.js" "services/mongodbService.js exists"
check "test -f services/logger.js" "services/logger.js exists"
check "test -f models/dataModels.js" "models/dataModels.js exists"
check "test -f test.js" "test.js exists"

# npm Modules Check
check "test -d node_modules" "node_modules directory exists"
check "npm list discord-interactions 2>/dev/null | grep -q discord-interactions" "discord-interactions installed"
check "npm list mongodb 2>/dev/null | grep -q mongodb" "mongodb installed"
check "npm list dotenv 2>/dev/null | grep -q dotenv" "dotenv installed"
check "npm list express 2>/dev/null | grep -q express" "express installed"
check "npm list node-fetch 2>/dev/null | grep -q node-fetch" "node-fetch installed"

# MongoDB Check
echo ""
echo "MongoDB Status:"
if systemctl is-active --quiet mongod; then
  echo -e "${GREEN}✓${NC} MongoDB service is running"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC} MongoDB service is not running (will be checked during tests)"
  echo "   Start with: sudo systemctl start mongod"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASSED + FAILED))
echo -e "Checks Passed: ${GREEN}$PASSED${NC}/$TOTAL"

if [ $FAILED -gt 0 ]; then
  echo -e "Checks Failed: ${RED}$FAILED${NC}/$TOTAL"
  echo ""
  echo -e "${YELLOW}⚠️  Run: npm install${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}✅ All prerequisites met! Ready to test.${NC}"
  echo -e "Run: ${GREEN}npm run test${NC}"
  exit 0
fi
