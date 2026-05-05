# 📋 Daily Tracking Commands - Complete Guide

Comprehensive guide to using MCP Bot's daily tracking slash commands.

---

## Quick Reference

| Command | Category | Description |
|---------|----------|-------------|
| `/task-completed` | Tracking | Log a completed task with streak updates |
| `/yesterday-summary` | Tracking | AI summary of yesterday's work |
| `/today-plan` | Tracking | Plan today and get AI suggestions |
| `/get-motivation` | Motivation | Daily motivation tips & tech news |
| `/team-stats` | Team | View team statistics & AI insights |
| `/leaderboard` | Team | Global leaderboard & daily rankings |
| `/view-streak` | Stats | Check your current & longest streaks |

---

## Command Details

### 1️⃣ `/task-completed` - Log Your Work

**Purpose:** Record a task you completed today

**Options:**
- `task_name` (Required) - What did you complete? (max 100 chars)
- `details` (Optional) - More details (max 500 chars)
- `category` (Optional) - Task category

**Categories:**
- 🔧 `coding` - Writing/debugging code
- 📚 `documentation` - Writing docs
- 👀 `review` - Code reviews
- 📋 `planning` - Planning & design
- 🧪 `testing` - QA & testing
- 📌 `other` - Anything else

**Example Usage:**
```
/task-completed task_name:Implemented user auth category:coding details:Added JWT token validation
```

**What It Does:**
1. ✅ Saves task to database
2. 📊 Updates your statistics
3. 🏆 Tracks achievements & points
4. 💾 Logs your activity

**Response Format:**
```
Great work, @username! 🎉

Task: Implemented user auth
Category: coding

📊 Your Stats:
• Total Points: 250
• Achievements: 5
```

**Behind the Scenes:**
- Calls `mongodbService.addDailyTask()` to save
- Calls `mongodbService.logActivity()` to track
- Retrieves user achievements and points
- Returns formatted response with stats

---

### 2️⃣ `/yesterday-summary` - Review Yesterday's Work

**Purpose:** Get AI-generated summary of yesterday's completed tasks

**Options:** None

**Example Usage:**
```
/yesterday-summary
```

**What It Does:**
1. 🔍 Retrieves all tasks from yesterday
2. 🤖 Sends to Groq AI for analysis
3. 📝 Generates professional summary
4. 💬 Returns summary to Discord

**Response Format:**
```
📋 Yesterday's Summary

Excellent productivity day! You completed 5 quality tasks across multiple areas.
Your focus on code review (2 tasks) shows strong team collaboration. The 
documentation improvements will help the team maintain codebase clarity.
Consider: Have you started the performance optimization task scheduled for today?

Tasks Completed: 5
```

**How It Works:**
1. Queries database for yesterday's date (YYYY-MM-DD)
2. Groups tasks by category
3. Calls `groqService.getResponse()` with `DAILY_TASK_SUMMARIZER` prompt
4. Uses deferred response for AI processing time
5. Sends followup with AI summary

**AI Prompt Used:**
```
You are a productivity coach. Review these daily tasks and provide:
- Positive feedback on what was accomplished
- Areas of strength
- Constructive suggestions for improvement
- Encouragement and motivation
```

---

### 3️⃣ `/today-plan` - Plan Your Day

**Purpose:** Plan today's tasks and get AI suggestions

**Options:** None

**Example Usage:**
```
/today-plan
```

**What It Does:**
1. 📅 Retrieves today's planned tasks
2. 📊 Analyzes yesterday's performance
3. 🤖 Gets AI suggestions
4. 💡 Returns personalized plan

**Response Format:**
```
📅 Today's Plan

Based on your 5 tasks completed yesterday, here's my recommendation:
1. Start with the performance optimization task (2-3 hours)
2. Schedule code review for mid-afternoon when energy is highest
3. Block 1 hour for documentation updates
4. Leave buffer time for unexpected issues

Your planned tasks look well-balanced. Focus on deep work first thing.

Planned Tasks: 4
```

**How It Works:**
1. Gets today's tasks from database
2. Gets yesterday's tasks for context
3. Calls `groqService.getResponse()` with `TASK_ANALYZER` prompt
4. Includes yesterday's task count for continuity
5. Returns AI-generated plan

**AI Prompt Used:**
```
You are an expert task management coach. Given the user's planned tasks for 
today and their performance yesterday, provide:
- Optimal task ordering strategy
- Time estimates for each type
- Productivity tips
- Motivation for the day ahead
```

---

### 4️⃣ `/get-motivation` - Daily Motivation & Tech News

**Purpose:** Get personalized motivation and stay updated on tech trends

**Options:** None

**Example Usage:**
```
/get-motivation
```

**What It Does:**
1. 👤 Retrieves your personal stats (points & achievements)
2. 🧠 Generates personalized motivation tip
3. 🚀 Fetches latest tech news
4. 🎯 Provides daily inspiration

**Response Format:**
```
💪 Daily Motivation & Tech News

Your Motivation:
You've earned 250 points across 5 achievements - that's fantastic dedication!
Your consistent daily progress shows real commitment to growth. Today, focus on
quality over quantity. One deep, meaningful task beats five shallow ones.

🚀 Tech News:
MCP (Model Context Protocol) continues gaining traction with major framework
integrations announced this week. Groq's latest performance improvements show
30% faster inference across language models. New AI agent frameworks focus on
reasoning and planning - perfect for complex task automation.

Your Stats: 250 pts | 5 achievements
```

**How It Works:**
1. Gets user points: `mongodbService.getUserTotalPoints()`
2. Gets achievements: `mongodbService.getUserAchievements()`
3. Parallel calls to Groq for:
   - **Motivation:** Uses `ACHIEVEMENT_TIP_GENERATOR` prompt
   - **Tech News:** Uses `MCP_NEWS_GENERATOR` prompt
4. Combines responses with user stats

**AI Prompts Used:**

*Achievement Tip Generator:*
```
Given a user with X points and Y achievements, provide personalized daily
motivation that:
- Celebrates their progress
- Encourages continued growth
- Provides actionable daily advice
- Keeps tone enthusiastic and supportive
```

*MCP News Generator:*
```
Share the latest exciting developments in:
- Model Context Protocol (MCP)
- AI and Large Language Models
- Development frameworks and tools
- Keep updates concise and relevant to software developers
```

---

### 5️⃣ `/team-stats` - Team Dashboard

**Purpose:** View team statistics, leaderboard, and AI-generated insights

**Options:** None

**Example Usage:**
```
/team-stats
```

**What It Does:**
1. 📊 Retrieves today's team statistics
2. 🏆 Builds leaderboard from top contributors
3. 📈 Shows category breakdown
4. 🤖 Gets AI-generated team insights
5. 💬 Returns formatted dashboard

**Response Format:**
```
📊 Team Statistics Dashboard

Overview:
🎯 Total Tasks: 12
👥 Active Members: 5
📈 Categories: 3

Category Breakdown:
• coding: 7 tasks
• documentation: 3 tasks
• review: 2 tasks

🏆 Top Contributors:
1. @alice - 350 pts
2. @bob - 280 pts
3. @charlie - 200 pts
4. @diana - 180 pts
5. @eva - 150 pts

📈 Team Insights:
Your team showed strong performance today! Coding work dominated 
(58% of tasks), demonstrating focus. Documentation contributions are 
solid. Consider scheduling pair reviews to boost collaboration.

Keep up the great work, team! 💪
```

**How It Works:**
1. Gets team stats: `mongodbService.getTeamStats()`
2. Gets top contributors: `mongodbService.getTeamTopContributors(5)`
3. Formats category breakdown
4. Calls Groq for insights using `TEAM_ANALYTICS` prompt
5. Uses deferred response for AI processing time
6. Sends formatted dashboard via webhook followup

**AI Prompt Used:**

*Team Analytics:*
```
You are a team performance analyst. Analyze the provided team statistics 
and generate insights:
1. Overall team performance assessment
2. Top contributor recognition
3. Recommended focus areas
4. Encouraging message for the team
Keep it concise (3-4 sentences) and constructive.
```

**Database Operations:**
- `getTeamStats()` - Aggregates today's task metrics
- `getTeamTopContributors(5)` - Gets top 5 by achievement points
- Queries: achievements collection with aggregation pipeline

---

### 6️⃣ `/view-streak` - Streak Tracker

**Purpose:** Check your current and longest streaks

**Options:** None

**Example Usage:**
```
/view-streak
```

**What It Does:**
1. 📊 Retrieves your streak data
2. 🔥 Shows current streak days
3. 🏆 Shows longest streak ever
4. 📅 Shows last task date
5. 💪 Displays motivational message

**Response Format:**
```
🔥 On Fire!

@username's Streak:
📊 Current Streak: 7 days
🏆 Longest Streak: 14 days
📅 Last Task: 2026-05-05

You're 7 days into an amazing streak!
```

**How It Works:**
1. Gets streak record: `mongodbService.getUserStreak(userId)`
2. Calculates streak status (🔥 = 3+, 📈 = active, ❄️ = inactive)
3. Shows encouraging message based on progress
4. Returns formatted streak display

---

### 7️⃣ `/leaderboard` - Global Rankings

**Purpose:** View top performers and compete on the leaderboard

**Options:** None

**Example Usage:**
```
/leaderboard
```

**What It Does:**
1. 🏆 Gets all-time top performers
2. 🔥 Gets today's top performers
3. 📊 Shows both leaderboards
4. 🎖️ Uses medal rankings
5. 💪 Motivates continued competition

**Response Format:**
```
🏆 Global Leaderboard

🎖️ All-Time Champions:
🥇 @alice - 1250 pts (25 achievements)
🥈 @bob - 950 pts (18 achievements)
🥉 @charlie - 850 pts (16 achievements)
#4️⃣ @diana - 700 pts (14 achievements)
#5️⃣ @eva - 650 pts (12 achievements)

🔥 Today's Top Performers:
🔥 @bob - 5 tasks
⭐ @alice - 4 tasks
💫 @charlie - 3 tasks
✨ @diana - 2 tasks
🌟 @eva - 1 task

Keep pushing to reach the top! Every task brings you closer. 💪
```

**How It Works:**
1. Gets all-time: `mongodbService.getTeamTopContributors(10)`
2. Gets today: `mongodbService.getTopPerformersToday(10)`
3. Formats top 5 from each list
4. Adds medal emojis (🥇🥈🥉#4#5 for all-time, 🔥⭐💫✨🌟 for today)
5. Returns motivational message

**Database Operations:**
- `getTeamTopContributors(limit)` - Top all-time by achievement points
- `getTopPerformersToday(limit)` - Top today by task count
- Aggregation pipelines for performance optimization

---

## Streak & Achievement System

### How Streaks Work

**Streak Definition:** Consecutive days with at least one task logged

**Streak Rules:**
1. Each task logs the current date
2. System checks if date is consecutive
3. If consecutive: increment streak
4. If gap: reset streak to 1
5. Tracks both current and longest streaks

**Streak Milestones (Auto-Triggered):**
- 3 days: 🔥 **On Fire!** (+25 pts)
- 7 days: 🌟 **Weekly Champion** (+50 pts)
- 14 days: 💪 **Unstoppable** (+100 pts)
- 30 days: 👑 **Titan** (+250 pts)
- 60 days: 🚀 **Immortal** (+500 pts)
- 100 days: ✨ **Eternal** (+1000 pts)

**How to Build a Streak:**
1. Log task with `/task-completed` every day
2. System automatically tracks consecutive days
3. Unlock milestone achievements for bonuses
4. Compete on `/leaderboard` to see your rank
5. Use `/view-streak` to check progress

---

## Data Flow Diagrams

### Task Completion Flow
```
User: /task-completed
    ↓
Discord receives command
    ↓
app.js routes to handleTaskCompleted()
    ↓
commands.js processes options
    ↓
MongoDBService.addDailyTask()  ← Saves to daily_tasks collection
    ↓
MongoDBService.updateUserStreak()  ← Updates streak, checks milestones
    ↓
MongoDBService.recordAchievement()  ← Records any milestone achievements
    ↓
MongoDBService.getUserAchievements()  ← Retrieves achievements
    ↓
MongoDBService.getUserTotalPoints()   ← Calculates points
    ↓
Response with stats + streak + milestones sent to Discord
```

### AI Summary Flow
```
User: /yesterday-summary
    ↓
Deferred response sent (tells Discord to wait)
    ↓
MongoDBService.getYesterdaysTasks()
    ↓
Format tasks for AI
    ↓
GroqService.getResponse(prompt) with 4-key rotation
    ↓
Cache check (reuse if within 1 hour)
    ↓
If not cached: API call to Groq
    ↓
Response sent via webhook followup
```

---

## Database Schema

### Tasks Saved
```javascript
{
  userId: "discord-user-id",
  taskName: "Task description",
  category: "coding|documentation|review|planning|testing|other",
  details: "Optional detailed description",
  date: "2026-05-05",  // YYYY-MM-DD format
  status: "completed",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Activity Logged
```javascript
{
  userId: "discord-user-id",
  action: "task_logged",
  metadata: {
    taskName: "...",
    category: "..."
  },
  timestamp: ISODate  // Auto-expires after 30 days
}
```

---

## Error Handling

### Common Errors & Solutions

**❌ "Error: task_name is required"**
- Solution: Provide the `task_name` parameter

**❌ "Error generating summary"**
- MongoDB issue: Check if database is running
- Groq issue: Check API keys in .env
- Solution: Retry in a moment

**❌ "No tasks found for yesterday"**
- Normal if no tasks logged yesterday
- Log some tasks first using `/task-completed`

**❌ "Connection failed: MongoDB"**
- Start MongoDB: `sudo systemctl start mongod`
- Check .env has correct MONGODB_URI

---

## Integration Details

### Service Integration

**MongoDBService Methods Used:**
- `addDailyTask(userId, taskData)` - Save task
- `getTodaysTasks(userId)` - Get today's work
- `getYesterdaysTasks(userId)` - Get yesterday's work
- `getUserAchievements(userId, limit)` - Get achievements
- `getUserTotalPoints(userId)` - Calculate points
- `logActivity(userId, action, metadata)` - Track actions

**GroqService Methods Used:**
- `getResponse(message, prompt, temperature, maxTokens)` - AI calls
- Features: 4-key rotation, caching, failover

**Logger Methods Used:**
- `info()` - Track command usage
- `error()` - Log failures
- `warn()` - Log warnings

---

## Performance Optimization

### Caching Strategy
- Motivation tips: 1-hour cache
- Tech news: 24-hour cache
- Task summaries: 1-hour cache

### Database Optimization
- Indexes on `userId`, `date`, `createdAt`
- Connection pool: 2-10 connections
- TTL on activity logs: 30 days

### API Optimization
- 4 Groq keys with automatic rotation
- 3 retry attempts per request
- Exponential backoff (1s, 2s, 4s)

---

## Testing Commands

### Quick Test Workflow
```bash
# 1. Register commands
npm run register

# 2. In Discord, try:
/task-completed task_name:"Setup database" category:"coding"

# 3. Wait a moment, then try:
/yesterday-summary

# 4. For today's plan:
/today-plan

# 5. For motivation:
/get-motivation
```

### Verify with Logs
```bash
# Watch logs while testing
npm run dev

# You should see:
# [Commands] Task completed: Setup database
# [Commands] Yesterday summary requested
# [API] POST /interactions - 200ms
```

---

## Next Steps

1. ✅ **Register Commands** - `npm run register`
2. 🧪 **Test Each Command** - Try them in Discord
3. 🎯 **Log Regular Tasks** - Build your history
4. 📊 **Check Statistics** - View your achievements
5. 🚀 **Add to Workflow** - Use daily for team!

---

**Last Updated:** May 5, 2026  
**Status:** Daily Tracking Commands Complete ✅
