#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub Setup for mcp-bot${NC}"
echo "=============================="
echo ""

# Check if git is initialized
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git already initialized${NC}"
    read -p "Reinitialize? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .git
        echo -e "${GREEN}✅ Removed old git repo${NC}"
    else
        echo "Using existing git repo"
    fi
fi

# Initialize git repo
if [ ! -d ".git" ]; then
    echo -e "${BLUE}📍 Initializing git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

echo ""
echo -e "${BLUE}📍 Adding files...${NC}"
git add .

echo -e "${GREEN}✅ Files added${NC}"
echo ""

# Count files
FILE_COUNT=$(git ls-files | wc -l)
echo -e "${BLUE}📊 Files to commit: $FILE_COUNT${NC}"
echo ""

# Create initial commit
echo -e "${BLUE}📍 Creating initial commit...${NC}"
git commit -m "🚀 Initial commit: mcp-bot with 7 Discord commands, AI integration, and database"

echo -e "${GREEN}✅ Commit created${NC}"
echo ""

# Get the GitHub repo URL
GITHUB_REPO="git@github.com:medaminekoubaa/mcp-bot-.git"

echo -e "${BLUE}📍 Adding remote repository...${NC}"
echo "Remote URL: $GITHUB_REPO"

# Remove existing remote if it exists
git remote remove origin 2>/dev/null

# Add new remote
git remote add origin "$GITHUB_REPO"

echo -e "${GREEN}✅ Remote added${NC}"
echo ""

# Test SSH connection
echo -e "${BLUE}📍 Testing SSH connection to GitHub...${NC}"
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  SSH connection may need verification${NC}"
    echo "First time connecting to GitHub? You may see a prompt to confirm."
fi

echo ""
echo -e "${BLUE}📍 Pushing to GitHub...${NC}"

# Push to main branch
if git push -u origin master 2>&1; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
elif git push -u origin main 2>&1; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Push failed${NC}"
    echo "Troubleshooting:"
    echo "1. Check SSH key is added to GitHub (Settings → SSH and GPG keys)"
    echo "2. Verify repo is empty (no README, no commits)"
    echo "3. Run: ssh -T git@github.com"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo "Your repo is now on GitHub!"
echo "Repository: $GITHUB_REPO"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/medaminekoubaa/mcp-bot-"
echo "2. Setup Render to auto-deploy from GitHub"
echo ""
echo "✅ Ready to deploy on Render!"

