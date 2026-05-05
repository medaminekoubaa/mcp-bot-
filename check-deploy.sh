#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 MCP Bot - Pre-Deployment Validator"
echo "======================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Create .env file first (copy from .env.sample)"
    exit 1
fi

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

# Array to track errors
ERRORS=0

# Function to check variable
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name is not set${NC}"
        ERRORS=$((ERRORS + 1))
    else
        # Show partial value (hide sensitive data)
        if [ ${#var_value} -gt 20 ]; then
            partial_value="${var_value:0:10}...${var_value: -10}"
        else
            partial_value="***"
        fi
        echo -e "${GREEN}✅ $var_name is set${NC}"
    fi
}

echo "📋 Checking Required Environment Variables:"
echo ""

check_var "APP_ID"
check_var "DISCORD_TOKEN"
check_var "PUBLIC_KEY"
check_var "GROQ_API_KEY_1"
check_var "GROQ_API_KEY_2"
check_var "GROQ_API_KEY_3"
check_var "GROQ_API_KEY_4"
check_var "MONGODB_URI"
check_var "PORT"
check_var "NODE_ENV"

echo ""
echo "📦 Checking Project Files:"
echo ""

# Check package.json
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json found${NC}"
else
    echo -e "${RED}❌ package.json not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check main app.js
if [ -f "src/app.js" ]; then
    echo -e "${GREEN}✅ src/app.js found${NC}"
else
    echo -e "${RED}❌ src/app.js not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if node_modules exist
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules installed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found - run 'npm install'${NC}"
fi

echo ""
echo "🧪 Checking Tests:"
echo ""

# Run tests
if npm run test > /dev/null 2>&1; then
    echo -e "${GREEN}✅ All tests passing${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📊 Deployment Readiness Summary:"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "You're ready to deploy! Next steps:"
    echo "1. Zip your project (without node_modules)"
    echo "2. Create Render service"
    echo "3. Add these environment variables to Render"
    echo "4. Deploy!"
    echo ""
    echo "🚀 See docs/DEPLOY_FREE.md for detailed instructions"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS issue(s)${NC}"
    echo ""
    echo "Fix the above issues before deploying!"
    echo "Check docs/DEPLOY_FREE.md for help"
    exit 1
fi
