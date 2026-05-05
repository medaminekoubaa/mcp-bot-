# 🧪 Testing Guide & Bot Usage

Complete guide to testing the MCP Bot locally and in production, plus comprehensive usage instructions.

---

## 📋 Table of Contents

- [Local Testing](#local-testing)
- [Command Testing](#command-testing)
- [Database Testing](#database-testing)
- [API Integration Testing](#api-integration-testing)
- [Deployment Testing](#deployment-testing)
- [Troubleshooting](#troubleshooting)

---

## 🏠 Local Testing

### Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm
npm --version
```

### 1. Setup Local Environment

```bash
# Clone and navigate to project
cd /home/needaimdark/Desktop/mcp-bot

# Install dependencies
npm install

# Create .env file
cp .env.sample .env

# Edit .env with your credentials
nano .env
```

### 2. Register Commands

```bash
npm run register

# Expected output:
# 📋 Registering Discord commands...
# 📝 Daily Tracking Commands: 7
# 📝 Legacy Commands: 2
# 📝 Total Commands: 9
# ✅ Commands registered successfully!
```

### 3. Start Local Bot

```bash
npm start

# Expected output:
# [GroqService] Initialized with 4 API keys
# [MongoDB] Connecting to database...
# [MongoDB] ✅ Connected successfully
# [MongoDB] ✅ Indexes created
# [2026-05-05T10:56:43.802Z] [INFO] [Bot] Services initialized
# [2026-05-05T10:56:43.802Z] [INFO] [Bot] Express app listening on port 3000
```

---

## 🎮 Command Testing

### Test 1: Simple Verification (`/test`)

**In Discord Channel:**
```
/test
```

**Expected Response:**
```
hello world 😀
(or any random emoji)
```

**Verification:** Bot is responding to commands

---

### Test 2: Task Logging (`/task-completed`)

**In Discord Channel:**
```
/task-completed task_name: "Build Login Feature" category: "coding"
```

**Expected Response:**
```
Great work, @username! 🎉

**Task:** Build Login Feature
**Category:** coding

📊 **Your Stats:**
• Total Points: 50
• Achievements: 1
```

**Verification Checklist:**
- ✅ Task saved in MongoDB
- ✅ Points awarded
- ✅ Streak incremented
- ✅ Database shows task logged

**Check Database:**
```javascript
db.daily_tasks.findOne({userId: "YOUR_USER_ID"})

// Should return:
{
  _id: ObjectId("..."),
  userId: "YOUR_USER_ID",
  taskName: "Build Login Feature",
  category: "coding",
  date: "2026-05-05",
  status: "completed",
  createdAt: ISODate("2026-05-05T12:30:00Z")
}
```

---

### Test 3: Motivation Command (`/get-motivation`)

**In Discord Channel:**
```
/get-motivation
```

**Expected Response:**
```
[AI-Generated Motivational Message from Groq LLaMA]

Example: "You're doing amazing! Keep pushing forward and remember that every task 
completed is a step towards your goals. Your consistency is your superpower! 💪"
```

**Verification Checklist:**
- ✅ Groq API called successfully
- ✅ Response generated and cached
- ✅ No API errors in bot logs
- ✅ Message displayed in Discord

**Check Logs:**
```bash
# Should show no Groq API errors like:
# [GroqService] Attempt 1/12 using key 1
# [GroqService] ✅ Response cached for: daily_summarizer_your_user_id
```

---

### Test 4: Streak Display (`/view-streak`)

**In Discord Channel:**
```
/view-streak
```

**Expected Response:**
```
📊 **Your Streak:**
🔥 Current Streak: 5 days!
🏆 Longest Streak: 12 days

Keep up the amazing work!
```

**Verification:**
- ✅ Correct streak count displayed
- ✅ Historical longest streak shown

---

### Test 5: Yesterday Summary (`/yesterday-summary`)

**In Discord Channel:**
```
/yesterday-summary
```

**Expected Response:**
```
📋 **Yesterday's Summary:**

You completed 3 tasks:
1. Built API endpoints (coding)
2. Fixed UI bug (testing)
3. Reviewed pull request (review)

AI Insight: "Great day of productivity! You balanced development with quality assurance, 
showing well-rounded contributions to the team."

Points Earned: 150
Streak Maintained: 5 days 🔥
```

---

### Test 6: Game Command (`/challenge`)

**In Discord Channel:**
```
/challenge
```

**Expected Interaction:**
1. Bot displays a select menu with options: Rock, Paper, Scissors, Lizard, Spock, etc.
2. User clicks an option
3. Bot responds with result (win/lose/tie)

**Example Response:**
```
Nice!
You chose **rock**
I chose **scissors**

You won! 🎉
```

---

### Test 7: Team Statistics (`/team-stats`)

**In Discord Channel:**
```
/team-stats
```

**Expected Response:**
```
📊 **Team Statistics:**

Total Members: 5
Tasks Completed Today: 12
Team Points: 500
Active Streaks: 3

🏆 Top Performer: @john (8-day streak)
📈 Total Tasks This Week: 45
```

---

## 💾 Database Testing

### MongoDB Connection Test

```bash
# Test connection manually
mongosh "mongodb+srv://mcp_bot_user:PASSWORD@mcp-bot.nazxpiz.mongodb.net/mcp-bot"

# Expected: Connected to MongoDB

# Check collections
show collections

# Expected output:
# daily_tasks
# user_activity
# achievements
# team_stats
```

### Verify Data Persistence

```javascript
// In MongoDB Shell

// 1. Check if task was saved
db.daily_tasks.findOne({taskName: "Build Login Feature"})

// 2. Check user activity log
db.user_activity.find({userId: "YOUR_USER_ID"}).limit(5)

// 3. Check achievements
db.achievements.find({userId: "YOUR_USER_ID"})

// 4. Check indexes
db.daily_tasks.getIndexes()
```

---

## 🔌 API Integration Testing

### Test Groq API

```bash
# Test with curl (manual endpoint call)
curl -X POST http://localhost:3000/interactions \
  -H "Content-Type: application/json" \
  -H "X-Signature-Ed25519: $(echo -n '' | od -An -tx1 | tr -d ' ')" \
  -H "X-Signature-Timestamp: $(date +%s)" \
  -d '{
    "type": 1,
    "id": "test123",
    "application_id": "1501124494281146388",
    "data": {}
  }'

# Expected response:
# [discord-interactions] Invalid signature
# (This is normal for manual curl - Discord signature validation)
```

### Test Discord Signature Verification

**Expected Behavior:**
- ✅ Valid Discord signatures → Command processed
- ❌ Invalid signatures → 401 Unauthorized returned
- ❌ Missing signature headers → Rejected

**Check Logs:**
```bash
# For valid requests:
# [2026-05-05T12:30:43.802Z] [INFO] [Bot] Received command: task-completed

# For invalid requests:
# [discord-interactions] Invalid signature
```

---

## 🚀 Deployment Testing

### Pre-Deployment Checklist

```bash
# 1. Build and syntax check
npm run lint

# 2. Test locally
npm start

# 3. Register commands
npm run register

# 4. Test all commands work in Discord

# 5. Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Render Deployment Test

1. **Check Build Logs:**
   - Go to Render Dashboard
   - Select `mcp-bot-azzk`
   - Click "Logs" tab
   - Verify: `✅ Connected successfully` and `Indexes created`

2. **Verify Endpoint:**
   ```bash
   curl -X POST https://mcp-bot-azzk.onrender.com/interactions \
     -H "Content-Type: application/json" \
     -d '{"type":1,"id":"test","application_id":"1501124494281146388","data":{}}'
   
   # Should return 404 (expected for GET-like requests)
   # Important: Service is responding
   ```

3. **Test in Discord:**
   - Go to your test server
   - Type `/test`
   - Verify bot responds

---

## 🐛 Troubleshooting

### Issue: Bot Not Responding in Discord

**Symptom:** Commands typed but no response

**Diagnosis:**
```bash
# 1. Check if commands are registered
curl https://discord.com/api/v10/applications/1501124494281146388/commands \
  -H "Authorization: Bot YOUR_TOKEN"

# 2. Check Interactions Endpoint URL
# Discord Developer Portal → General Information → Interactions Endpoint URL
# Should be: https://mcp-bot-azzk.onrender.com/interactions

# 3. Check Render logs
# Dashboard → mcp-bot-azzk → Logs
# Look for: "[ERROR]" or "[MongoDB] Connection failed"
```

**Solutions:**
- Verify Interactions Endpoint URL is set and verified (green checkmark)
- Restart bot: `npm start`
- Check MongoDB connection: `mongosh <connection-string>`
- Verify Discord token hasn't been regenerated

---

### Issue: Groq API Errors

**Symptom:** `/get-motivation` returns error or delays

**Diagnosis:**
```bash
# Check logs for:
# - "[GroqService] Error: Groq API failed"
# - "429 Too Many Requests"
# - "model ... has been decommissioned"

# Solutions:
# 1. Check API key quota at https://console.groq.com
# 2. Verify model is current: llama-3.3-70b-versatile
# 3. Check rate limits (1 request per second typical)
```

---

### Issue: MongoDB Connection Timeout

**Symptom:** `[MongoDB] Connection failed: Server selection timed out`

**Diagnosis:**
```bash
# 1. Test connection string directly
mongosh "mongodb+srv://mcp_bot_user:PASSWORD@mcp-bot.nazxpiz.mongodb.net/mcp-bot"

# 2. Check IP whitelist
# MongoDB Atlas → Network Access → IP Whitelist
# Should have 0.0.0.0/0 (all IPs) or your Render IP

# 3. Verify credentials
# Check password doesn't have special chars needing URL encoding
```

---

### Issue: Commands Not Showing in Discord

**Symptom:** `/` autocomplete doesn't show any commands

**Solutions:**
```bash
# 1. Re-register commands
npm run register

# 2. Refresh Discord (Ctrl+R or Cmd+R)

# 3. Check bot permissions
# Server Settings → Roles → MCP-bot
# Verify "Use Application Commands" permission is enabled

# 4. Check bot is in the server
# Server Settings → Members → Search for MCP-bot
```

---

## ✅ Full Test Scenario

**Complete workflow to verify everything works:**

```bash
# Step 1: Start local bot
npm start

# Step 2: In Discord, run all commands in sequence
/test                              # Verify basic response
/task-completed task_name: "Test Task" category: "coding"  # Log task
/view-streak                       # Check streak updated
/get-motivation                    # Test AI
/yesterday-summary                 # Test AI summary
/challenge                         # Test game (select option)
/team-stats                        # Check team stats
/leaderboard                       # Check rankings

# Step 3: Verify database
# Check MongoDB has records for all activities

# Step 4: Verify logs
# Check bot logs show no errors
```

**Expected Result:** ✅ All commands respond correctly, data persists in MongoDB, no errors in logs

---

## 📊 Performance Testing

### Response Time Benchmarks

| Command | Expected Time | Actual |
|---------|---|---|
| `/test` | < 100ms | __ |
| `/task-completed` | < 500ms | __ |
| `/view-streak` | < 200ms | __ |
| `/get-motivation` | 1-3 sec (API call) | __ |
| `/challenge` | < 100ms | __ |

### Load Testing

**Test with multiple users:**
```bash
# Simulate 5 concurrent users logging tasks
for i in {1..5}; do
  curl -X POST http://localhost:3000/interactions \
    -d '...' &
done
wait

# Check for errors in logs
```

---

## 🔍 Monitoring & Logs

### Access Bot Logs (Local)

```bash
# Console output shows real-time logs
# Look for patterns:

# Success indicators:
# - "[MongoDB] ✅ Connected successfully"
# - "[GroqService] Initialized with X API keys"
# - "[2026-05-05T...] [INFO] [Bot] Services initialized"

# Error indicators:
# - "[ERROR]"
# - "Connection failed"
# - "Unauthorized"
```

### Access Bot Logs (Render)

1. Render Dashboard
2. Select `mcp-bot-azzk`
3. Click "Logs" tab
4. View real-time output

---

## 🎯 Next Steps

After successful testing:

1. ✅ Verify all commands work
2. ✅ Confirm database persistence
3. ✅ Test error handling
4. ✅ Deploy to production
5. ✅ Monitor for issues
6. ✅ Gather user feedback

---

**Happy testing!** 🚀
