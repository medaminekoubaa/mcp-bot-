# 🤖 MCP Bot - Discord Team Collaboration & AI Assistant

A professional-grade Discord bot for team collaboration, daily task tracking, achievement management, and AI-powered motivation with Groq integration.

[![Node.js](https://img.shields.io/badge/Node-v18+-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)](https://www.mongodb.com)
[![Groq AI](https://img.shields.io/badge/AI-Groq-blue)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Testing](#testing)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Contributing](#contributing)

---

## 🎯 Overview

MCP Bot is an intelligent Discord bot designed to help development teams:
- Track daily tasks and achievements
- Get AI-powered motivational tips
- Share tech news about MCP, AI, and frameworks
- Manage team productivity and collaboration
- Integrate with Groq AI for intelligent responses

**Tech Stack:**
- **Runtime:** Node.js 18+
- **Database:** MongoDB (with Atlas option)
- **AI:** Groq API (4 keys with automatic rotation)
- **Framework:** Express.js
- **Discord:** discord-interactions

---

## ✨ Features

### ✅ Core Features (Phase 1 - Built)
- [x] Groq API service with 4-key rotation & auto-failover
- [x] MongoDB database layer with CRUD operations
- [x] Professional logging system
- [x] Data validation & schemas
- [x] 27+ automated tests (100% pass rate)
- [x] **Daily Tracking Commands** (4 commands)
  - `/task-completed` - Log completed tasks with streaks
  - `/yesterday-summary` - AI-powered work summaries
  - `/today-plan` - Daily planning with suggestions
  - `/get-motivation` - Motivation tips & tech news
- [x] **Team Collaboration** (3 commands)
  - `/team-stats` - Team statistics dashboard
  - `/leaderboard` - Global rankings & daily top performers
  - `/view-streak` - Personal streak tracking
- [x] **Achievement System**
  - Streak tracking (3, 7, 14, 30, 60, 100 day milestones)
  - Automatic milestone achievements with bonus points
  - Personal achievement history

### 🚀 Upcoming Features (Phase 2-3)
- [ ] Voice channel integration
- [ ] Team statistics dashboard
- [ ] Advanced achievement system with streaks
- [ ] Scheduled daily reminders

---

## 📁 Project Structure

```
mcp-bot/
├── src/                              # Source code
│   ├── app.js                        # Main bot entry point
│   ├── commands.js                   # Discord command definitions
│   ├── constants.js                  # Configuration & system prompts
│   ├── game.js                       # Game logic (template)
│   ├── utils.js                      # Utility functions
│   ├── services/                     # Business logic services
│   │   ├── groqService.js           # Groq AI wrapper (4-key rotation)
│   │   ├── mongodbService.js        # Database operations
│   │   └── logger.js                # Logging system
│   └── models/                       # Data schemas & validation
│       └── dataModels.js            # Schema definitions
│
├── tests/                            # Testing suite
│   ├── test.js                      # 27+ automated tests
│   ├── check-prerequisites.sh       # Prerequisites checker
│   └── README.md                    # Testing guide
│
├── docs/                             # Documentation
│   ├── README.md                    # This file
│   ├── ARCHITECTURE.md              # System architecture
│   ├── SETUP.md                     # Setup guide
│   ├── TESTING_GUIDE.md             # Detailed testing
│   ├── MONGODB_SETUP.md             # Database setup
│   ├── API.md                       # API reference
│   └── TESTING_START_HERE.md        # Quick test guide
│
├── assets/                           # Images & resources
├── examples/                         # Example code snippets
├── .env                             # Environment variables (created)
├── .env.sample                      # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Node.js dependencies
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- MongoDB ([local](https://www.mongodb.com/docs/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))
- Discord Bot Token ([create app](https://discord.com/developers/applications))

### 1. Clone & Install

```bash
# Navigate to project
cd /home/needaimdark/Desktop/mcp-bot

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.sample .env

# Edit .env with your credentials
nano .env
```

Required variables:
```env
APP_ID=your_app_id
DISCORD_TOKEN=your_bot_token
PUBLIC_KEY=your_public_key
GROQ_API_KEY_1=your_groq_key_1
GROQ_API_KEY_2=your_groq_key_2
GROQ_API_KEY_3=your_groq_key_3
GROQ_API_KEY_4=your_groq_key_4
MONGODB_URI=mongodb://localhost:27017/mcp-bot
```

### 3. Start MongoDB

```bash
# Local MongoDB
sudo systemctl start mongod

# Or use MongoDB Atlas - update MONGODB_URI in .env
```

### 4. Run Tests

```bash
# Check prerequisites
bash tests/check-prerequisites.sh

# Run full test suite
npm run test
```

Expected: **27/27 tests passing (100%)**

### 5. Start the Bot

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

---

## 🧪 Testing

Complete testing documentation in [docs/TESTING_START_HERE.md](docs/TESTING_START_HERE.md)

### Quick Test

```bash
# Check all prerequisites
bash tests/check-prerequisites.sh

# Run all 27 tests
npm run test

# Expected output
# 🎉 ALL TESTS PASSED! Ready for development.
# Total Tests: 27
# ✓ Passed: 27
# ✗ Failed: 0
# Success Rate: 100.0%
```

### Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Constants | 5 | ✅ Pass |
| Logger | 3 | ✅ Pass |
| Validation | 3 | ✅ Pass |
| Groq Service | 5 | ✅ Pass |
| MongoDB | 11 | ✅ Pass |
| **Total** | **27** | **✅ Pass** |

---

## 🏗️ Architecture

### Service Architecture

```
Discord Bot
     ↓
Express Server (Port 3000)
     ↓
┌────────────────────────────────────┐
│     Command Handler                │
│  - task-completed                  │
│  - yesterday-summary               │
│  - today-plan                      │
│  - get-motivation                  │
└────────────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│  Services Layer                    │
├────────────────────────────────────┤
│ • GroqService (AI)                 │
│ • MongoDBService (Data)            │
│ • Logger (Logging)                 │
└────────────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│  External APIs                     │
├────────────────────────────────────┤
│ • Groq API (4 keys, rotation)      │
│ • MongoDB (connection pool)        │
│ • Discord API                      │
└────────────────────────────────────┘
```

### Data Flow

```
User Command
    ↓
Discord Bot
    ↓
GroqService (get AI response)
    ↓
MongoDBService (save task/activity)
    ↓
Logger (log all operations)
    ↓
Response sent to Discord
```

---

## 🔐 Key Features

### Groq API Management
- **4 API Keys** with automatic rotation
- **Intelligent Failover** - automatically switches if quota exceeded
- **Caching** - reduces API calls
- **Quota Tracking** - 24-hour wait before retrying

### MongoDB Operations
- **Connection Pooling** (2-10 connections)
- **Automatic Indexes** for performance
- **TTL Collections** (auto-cleanup after 30 days)
- **Aggregation Pipelines** for analytics

### Professional Code
- **Zero Hardcoding** - all strings in constants
- **Service Abstraction** - clean separation of concerns
- **Error Handling** - retry logic, fallbacks
- **Logging** - color-coded, timestamped
- **Validation** - schema validation on all data

---

## 📖 Documentation

- **[README.md](README.md)** - Project overview (this file)
- **[COMMANDS.md](docs/COMMANDS.md)** - Daily tracking commands guide
- **[SETUP.md](docs/SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design
- **[TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Testing procedures
- **[MONGODB_SETUP.md](docs/MONGODB_SETUP.md)** - Database setup
- **[API.md](docs/API.md)** - API reference

---

## 🛠️ Development

### Scripts

```bash
# Start bot (production)
npm start

# Start bot (development with auto-reload)
npm run dev

# Register slash commands
npm run register

# Run tests
npm run test

# Check prerequisites
bash tests/check-prerequisites.sh
```

### Project Standards

- ✅ No hardcoded strings (use constants.js)
- ✅ Services for external integrations
- ✅ Validation on all inputs
- ✅ Comprehensive logging
- ✅ Error handling with retries
- ✅ JSDoc comments on functions
- ✅ 100% test coverage for services

---

## 🚀 Next Phase

1. **Voice Integration** ✨
   - Voice channel support
   - Audio conversations
   - Transcription & responses

2. **Advanced Features**
   - Team statistics dashboard
   - Achievement streaks & milestones
   - Scheduled daily reminders

3. **Production Deployment**
   - Docker containerization
   - Cloud hosting setup
   - Monitoring & alerting

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 👥 Contributing

This is a team project for MCP development. Follow the code standards above.

---

## 📞 Support

- **Documentation:** See [docs/](docs/) folder
- **Tests:** Run `npm run test`
- **Issues:** Check [tests/test.js](tests/test.js)

---

**Last Updated:** May 5, 2026  
**Status:** Phase 1 Complete ✅ | 7 Commands Ready 🎉 | Production Ready 🚀
