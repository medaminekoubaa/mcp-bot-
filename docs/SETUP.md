# 📋 Setup Guide - MCP Bot

Step-by-step setup instructions to get MCP Bot running.

---

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- npm 9+ (comes with Node.js)
- MongoDB ([local](https://www.mongodb.com/docs/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))
- Discord Bot Token

---

## Step 1: Get Discord Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "MCP Bot")
4. Go to "General Information" tab
   - Copy **APPLICATION ID** → `APP_ID`
   - Copy **PUBLIC KEY** → `PUBLIC_KEY`
5. Go to "Bot" tab
   - Click "Add Bot"
   - Click "Reset Token"
   - Copy **TOKEN** → `DISCORD_TOKEN`
6. Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Read Messages`
   - Copy generated URL
7. Open URL in browser to add bot to your Discord server

---

## Step 2: Setup MongoDB

### Option A: Local MongoDB

**Linux (Ubuntu/Debian):**
```bash
# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --version
```

**macOS:**
```bash
# Install with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start
brew services start mongodb-community

# Verify
mongosh --version
```

**Windows:**
- Download: https://www.mongodb.com/try/download/community
- Run installer
- MongoDB starts automatically
- Verify: `mongosh` in PowerShell

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new project
4. Create cluster (M0 free tier)
5. Set database access (username/password)
6. Whitelist IP: 0.0.0.0/0 (dev only; restrict in prod)
7. Get connection string
8. Update in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mcp-bot?retryWrites=true&w=majority
   ```

---

## Step 3: Clone & Setup Project

```bash
# Navigate to mcp-bot directory
cd /home/needaimdark/Desktop/mcp-bot

# Install dependencies
npm install

# Verify installation
npm list | grep -E "discord-interactions|mongodb|dotenv|express|node-fetch"
```

Expected packages:
- discord-interactions ^4.0.0
- dotenv ^16.0.3
- express ^4.18.2
- mongodb ^6.3.0
- node-fetch ^2.7.0

---

## Step 4: Configure Environment

```bash
# Copy template
cp .env.sample .env

# Edit with your credentials
nano .env
```

Required values:
```env
# Discord
APP_ID=your_app_id_from_step_1
DISCORD_TOKEN=your_bot_token_from_step_1
PUBLIC_KEY=your_public_key_from_step_1

# Groq (you already have these)
GROQ_API_KEY_1=[your_groq_api_key_1_here]
GROQ_API_KEY_2=[your_groq_api_key_2_here]
GROQ_API_KEY_3=[your_groq_api_key_3_here]
GROQ_API_KEY_4=[your_groq_api_key_4_here]

# Database
MONGODB_URI=mongodb://localhost:27017/mcp-bot

# Logging
PORT=3000
LOG_LEVEL=INFO
ENABLE_CONSOLE_LOG=true
```

---

## Step 5: Verify Setup

```bash
# Check prerequisites
bash tests/check-prerequisites.sh

# Expected: All ✓ checks pass
```

If any checks fail:
```bash
# Reinstall dependencies
npm install

# Start MongoDB
sudo systemctl start mongod

# Verify .env file
cat .env | grep -v "^#"
```

---

## Step 6: Run Tests

```bash
# Run all 27 tests
npm run test

# Expected output:
# 🎉 ALL TESTS PASSED! Ready for development.
# Total Tests: 27
# ✓ Passed: 27
# ✗ Failed: 0
```

If tests fail:
- Check MongoDB is running: `sudo systemctl status mongod`
- Check .env has all variables: `cat .env`
- Check dependencies installed: `npm list`

---

## Step 7: Start the Bot

```bash
# Development mode (auto-reload with nodemon)
npm run dev

# Or production mode
npm start
```

Expected console output:
```
[GroqService] Initialized with 4 API keys
[MongoDB] Connecting to database...
[MongoDB] ✅ Connected successfully
Express app listening on port 3000
```

---

## Verify Bot is Running

In Discord:
1. Go to your server
2. Type `/` and look for bot commands
3. Try: `/task-completed`

If no commands appear:
```bash
# Register commands
npm run register
```

---

## Troubleshooting

### "Cannot find module 'mongodb'"
```bash
npm install
npm list mongodb
```

### "MongoDB connection refused"
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### "Invalid GROQ_API_KEY"
- Verify keys in `.env` are correct
- No extra spaces or quotes
- All 4 keys present

### "Port 3000 already in use"
```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Tests timeout
```bash
# MongoDB might be slow
# Restart MongoDB
sudo systemctl restart mongod

# Or increase timeout in test.js
```

---

## Next Steps

1. ✅ Setup complete
2. ✅ Tests passing
3. 📝 Next: Build daily tracking commands
4. 🤖 Then: Groq AI integration
5. 🎤 Then: Voice channel support

---

## Additional Resources

- [Discord.js Documentation](https://discord.js.org)
- [Groq API Docs](https://console.groq.com/docs)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Node.js Best Practices](https://nodejs.org/en/docs/)

---

**Last Updated:** May 5, 2026  
**Status:** Setup Verified ✅
