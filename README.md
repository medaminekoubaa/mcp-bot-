# 🤖 MCP Bot - Discord Team Collaboration & Motivation Hub

A powerful Discord bot that combines **AI-powered motivation**, **task tracking**, **team statistics**, and **gamification** to keep teams engaged and productive.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Installation & Deployment](#installation--deployment)
- [Commands](#commands)

---

## 🎯 Overview

**MCP Bot** is a Discord bot designed to help teams:
- 📝 **Track daily tasks** with automatic streak counting
- 🤖 **Get AI-powered motivation** using Groq's LLaMA model
- 📊 **View team statistics** and leaderboards
- 🎮 **Play interactive games** (Rock-Paper-Scissors with extended options)
- 🏆 **Unlock achievements** and earn points
- 💾 **Store all data** securely in MongoDB Atlas

---

## ✨ Features

### 1. **Daily Task Tracking**
- Log completed tasks with `/task-completed`
- Categorize tasks (coding, documentation, review, testing, deployment)
- Add detailed descriptions for each task
- Automatic streak tracking (consecutive days of activity)
- Milestone achievements unlock at 3, 7, 14, 30+ day streaks

### 2. **AI-Powered Motivation**
- `/get-motivation` - Generates personalized motivation from Groq LLaMA AI
- System-driven context-aware messages
- Caching system to optimize API usage and reduce costs

### 3. **Team Statistics**
- `/team-stats` - View aggregated team productivity metrics
- `/yesterday-summary` - AI-powered summary of team's previous day
- `/today-plan` - AI-assisted planning for today's work
- `/leaderboard` - Ranking of top performers

### 4. **Streak & Achievements**
- `/view-streak` - Personal streak counter (current & longest)
- Milestone achievements: 3-day, 7-day, 14-day, 30-day, 60-day streaks
- Points system for gamification
- Achievement badges and descriptions

### 5. **Interactive Games**
- `/challenge` - Rock-Paper-Scissors with extended options:
  - Rock, Paper, Scissors (classic)
  - Lizard, Spock (Rock-Paper-Scissors-Lizard-Spock variant)
  - Cowboy, Wumpus, Computer, Virus (custom extensions)

### 6. **Legacy Commands**
- `/test` - Simple hello command for bot verification

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────┐
│             Discord Server (WebSocket)              │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ HTTP POST /interactions
                  │ (Slash Commands, Button Clicks)
                  ▼
┌─────────────────────────────────────────────────────┐
│        Express Server (Node.js on port 3000)        │
│                  app.js                             │
│  - Verifies Discord signatures                      │
│  - Routes command types                             │
│  - Handles interactions                             │
└─────────┬──────────────────────────────────┬────────┘
          │                                  │
          ▼                                  ▼
   ┌─────────────────┐           ┌──────────────────────┐
   │   commands.js   │           │     game.js          │
   │                 │           │                      │
   │ - Task logging  │           │ - Rock-Paper-Scissors│
   │ - Summaries     │           │ - Game logic         │
   │ - Motivation    │           │ - Win/Loss/Tie calc  │
   │ - Team stats    │           └──────────────────────┘
   │ - Achievements  │
   └────────┬────────┘
            │
            ├─────────────────┬──────────────────┬─────────────────┐
            │                 │                  │                 │
            ▼                 ▼                  ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │mongodbService│  │groqService   │  │logger        │  │constants     │
    │              │  │              │  │              │  │              │
    │- Connect DB  │  │- AI Requests │  │- Log events  │  │- Config      │
    │- Queries     │  │- Key Rotation│  │- Error track │  │- Prompts     │
    │- Caching     │  │- Caching     │  │- Audit logs  │  │- Settings    │
    │- Indexes     │  │- Retry logic │  │              │  │              │
    └──────┬───────┘  └──────┬───────┘  └──────────────┘  └──────────────┘
           │                 │
           ▼                 ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ MongoDB Atlas    │  │ Groq AI API      │
    │ (Cloud)          │  │ (LLaMA 3.3-70B)  │
    │                  │  │                  │
    │ Collections:     │  │ 4 API keys       │
    │- daily_tasks     │  │ Auto-rotation    │
    │- user_activity   │  │ Quota handling   │
    │- achievements    │  │                  │
    │- team_stats      │  │                  │
    └──────────────────┘  └──────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js (v18+) | JavaScript runtime |
| **Framework** | Express.js | HTTP server & routing |
| **Discord Integration** | discord-interactions | Signature verification & types |
| **AI/LLM** | Groq API (LLaMA 3.3-70B) | Motivation & summaries |
| **Database** | MongoDB Atlas | Document storage |
| **Logger** | Custom Logger | Event tracking |
| **Hosting** | Render.com | Production deployment |

---

## 🔄 How It Works - Complete Flow

### **1. User Interaction Flow**

```
User Types Command in Discord
    │
    ├─► Discord verifies bot permissions
    │
    ├─► Discord POSTs to: /interactions endpoint (with signature)
    │
    ├─► Express receives request
    │
    ├─► discord-interactions middleware verifies signature
    │
    ├─► Interaction type determined (PING, COMMAND, COMPONENT)
    │
    ├─► Router directs to appropriate handler
    │
    ├─► Handler processes & calls services
    │
    ├─► Response sent back to Discord within 3 second window
    │
    └─► User sees bot response in channel
```

### **2. Example: `/task-completed` Command**

```
1. User types: /task-completed task_name: "Build API" category: "coding"

2. Discord sends:
   POST /interactions
   {
     "type": 2,
     "data": {
       "name": "task-completed",
       "options": [
         {"name": "task_name", "value": "Build API"},
         {"name": "category", "value": "coding"}
       ]
     },
     "member": {"user": {"id": "123456789", "username": "alice"}}
   }

3. Bot processes:
   ├─ Parse command options
   ├─ MongoDB: Save task to daily_tasks collection
   ├─ MongoDB: Log activity to user_activity
   ├─ MongoDB: Update streak (increment or reset)
   ├─ Check for milestone achievements (3, 7, 14, 30 days)
   ├─ Record achievements if unlocked
   ├─ Fetch user stats (total points, achievements)
   └─ Build response message with stats

4. Bot responds:
   {
     "type": 4,
     "data": {
       "content": "Great work, alice! 🎉\n\n**Task:** Build API\n**Category:** coding\n\n📊 **Your Stats:**\n• Total Points: 50\n• Achievements: 2\n• 🔥 Current Streak: 3 days!"
     }
   }

5. Discord displays response in channel
```

### **3. Example: `/get-motivation` Command**

```
1. User types: /get-motivation

2. Bot receives command

3. Check cache (avoid API calls):
   ├─ If cached & fresh (< 1 hour old) → Return cached response
   └─ If no cache → Continue to step 4

4. Call Groq AI API:
   ├─ Attempt with API key 1
   ├─ If quota error → Rotate to key 2
   ├─ If key 2 quota → Rotate to key 3
   ├─ Continue rotation until response
   ├─ Parse AI response
   └─ Cache result (1 hour TTL)

5. Format and send to user:
   {
     "type": 4,
     "data": {
       "content": "[AI Generated Motivation Message]"
     }
   }
```

### **4. Database Operations Example**

**When user logs a task:**

```javascript
// MongoDB Collections involved:

1. daily_tasks collection
   {
     _id: ObjectId,
     userId: "123456789",
     taskName: "Build API",
     details: "Implemented REST endpoints",
     category: "coding",
     date: "2026-05-05",
     status: "completed",
     createdAt: 2026-05-05T12:30:00Z
   }

2. user_activity collection
   {
     _id: ObjectId,
     userId: "123456789",
     action: "task_logged",
     metadata: {taskName: "Build API", category: "coding"},
     timestamp: 2026-05-05T12:30:00Z
   }

3. achievements collection (if milestone unlocked)
   {
     _id: ObjectId,
     userId: "123456789",
     title: "🔥 3-Day Streak",
     description: "Logged tasks for 3 consecutive days",
     points: 50,
     category: "milestone",
     unlockedAt: 2026-05-05T12:30:00Z
   }
```

---

## 📁 Project Structure

```
mcp-bot/
├── src/
│   ├── app.js                          # Main Express server & Discord interactions
│   ├── commands.js                     # Command handlers (task, summary, motivation, etc.)
│   ├── game.js                         # Rock-Paper-Scissors game logic
│   ├── register-commands.js            # Register commands with Discord
│   ├── utils.js                        # Discord API utilities
│   ├── constants.js                    # Config, prompts, settings
│   │
│   ├── models/
│   │   └── dataModels.js              # Database schema definitions
│   │
│   └── services/
│       ├── groqService.js             # AI/LLM service (Groq API)
│       ├── mongodbService.js          # Database service
│       └── logger.js                  # Logging & event tracking
│
├── tests/
│   ├── test.js                        # Integration tests
│   └── check-prerequisites.sh         # Environment validation
│
├── docs/
│   ├── TESTING.md                     # Testing guide & usage
│   └── (other documentation)
│
├── .env                               # Environment variables (Discord, Groq, MongoDB)
├── .env.sample                        # Template for .env
├── .gitignore                         # Git ignore rules
├── package.json                       # Node dependencies
├── README.md                          # This file
│
└── assets/
    └── (images, logos)
```

---

## 🚀 Installation & Deployment

### **Local Development**

```bash
# 1. Clone repository
git clone <repository-url>
cd mcp-bot

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.sample .env
# Edit .env with your Discord token, Groq keys, MongoDB URI

# 4. Register commands with Discord
npm run register

# 5. Start bot
npm start
```

### **Render Deployment** (Production)

1. Push to GitHub
2. Connect GitHub repo to Render
3. Set environment variables in Render dashboard
4. Deploy (auto-redeploy on push)

**Set Discord Interactions Endpoint URL:**
- Discord Developer Portal → General Information
- Interactions Endpoint URL: `https://mcp-bot-azzk.onrender.com/interactions`

---

## 🎮 Commands Reference

### Daily Tracking Commands

| Command | Purpose | Options |
|---------|---------|---------|
| `/task-completed` | Log a completed task | `task_name*`, `details`, `category` |
| `/yesterday-summary` | AI summary of yesterday's work | None |
| `/today-plan` | AI-assisted plan for today | None |
| `/get-motivation` | Get personalized AI motivation | None |
| `/team-stats` | View team statistics | None |
| `/view-streak` | Check your streak | None |
| `/leaderboard` | Top performers ranking | None |

### Legacy/Game Commands

| Command | Purpose |
|---------|---------|
| `/test` | Bot verification (responds with hello) |
| `/challenge` | Rock-Paper-Scissors game with extended options |

---

## 🔑 Environment Variables

```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
APP_ID=your_app_id
PUBLIC_KEY=your_public_key

# Groq API Keys (Rotation Support)
GROQ_API_KEY_1=gsk_xxxxx
GROQ_API_KEY_2=gsk_xxxxx
GROQ_API_KEY_3=gsk_xxxxx
GROQ_API_KEY_4=gsk_xxxxx

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Server Configuration
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=INFO
ENABLE_CONSOLE_LOG=true
```

---

## 📊 Data Models

### Task Document
```javascript
{
  userId: String,           // Discord user ID
  taskName: String,         // Task title (max 100 chars)
  details: String,          // Optional description (max 500 chars)
  category: String,         // coding|documentation|review|testing|deployment|other
  date: String,             // YYYY-MM-DD format
  status: String,           // completed|in-progress|pending
  createdAt: Date           // Timestamp
}
```

### User Streak
```javascript
{
  userId: String,
  currentStreak: Number,    // Days in current streak
  longestStreak: Number,    // Historical longest streak
  lastTaskDate: String,     // Last task completion date
  updatedAt: Date
}
```

### Achievement
```javascript
{
  userId: String,
  title: String,            // Achievement name
  description: String,      // Details
  points: Number,           // Points awarded
  category: String,         // milestone|badge|other
  unlockedAt: Date
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Bot not responding in Discord** | Check Interactions Endpoint URL in Discord Developer Portal |
| **MongoDB connection fails** | Verify connection string, IP whitelist, and credentials |
| **Groq API errors** | Check API keys, model availability, quota limits |
| **Commands not showing up** | Run `npm run register` to re-register commands |
| **Signature verification failed** | Verify PUBLIC_KEY in `.env` matches Discord portal |

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Support & Contributions

For issues, questions, or contributions:
- Create an issue on GitHub
- Submit pull requests with improvements
- Test thoroughly before deployment

---

**Made with ❤️ by the MCP Bot Team**
