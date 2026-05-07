# 🚀 MCP Bot - Discord Server Setup Guide

**Complete step-by-step guide to organize your Discord server for MCP Bot**

---

## 📋 Pre-Setup Checklist

Before you start, make sure:
- ✅ Bot is deployed and working
- ✅ You have admin access to the Discord server
- ✅ You can create/rename channels
- ✅ You have 30 minutes for complete setup

---

## 🎯 Phase 1: Create/Organize Channels

### Step 1.1: Create 8 Managed Channels

Go to your Discord server and create these channels (or rename existing ones):

**Channel Name** | **Purpose** | **Topic**
---|---|---
`daily-tasks` | Daily work tracking | Track daily tasks and plan your day
`team` | Team performance | View team stats, streaks, leaderboard
`dev-tracking` | Development progress | Log MCP development and view team analytics
`chat-with-ia` | Private AI chats | Create private AI sessions about MCP
`mcp-learning` | Learning & tips | Learn MCP, Docker, AI, get daily tips
`general` | Motivation | Daily motivation and team announcements
`documentation` | Guides & docs | Pinned guides and reference materials
`announcements` | Important updates | Team announcements and feature updates

### Step 1.2: Channel Topic (Optional but Recommended)

Go to each channel → Channel Settings → Edit → Topic

Paste this (will appear in channel list):

**For daily-tasks:**
```
📅 Track your daily work! Use /yesterday-summary, /today-plan, /task-completed
```

**For team:**
```
👥 Team performance! Use /team-stats, /view-streak, /leaderboard
```

**For dev-tracking:**
```
🔨 Log your MCP development! Use /dev-update, /team-progress
```

**For chat-with-ia:**
```
💬 Private AI chat about MCP! Use /chat to start, /ask to chat
```

**For mcp-learning:**
```
📚 Learn MCP! Use /mcp-learn, /daily-tip, /challenge-solver, /ai-insights
```

**For general:**
```
📍 Daily motivation and team announcements! Use /get-motivation
```

**For documentation:**
```
📖 Complete guides and reference materials. Read the pinned messages!
```

**For announcements:**
```
🎯 Important team updates and feature announcements
```

---

## 🔐 Phase 2: Set Channel Permissions

### Step 2.1: Basic Setup (Simple)

For each channel:
1. Right-click channel → Edit Channel
2. Go to Permissions tab
3. Add role: @everyone
4. Allow: **View Channel**, **Send Messages**, **Read Message History**

### Step 2.2: Advanced Setup (Recommended)

**For read-only channels (#documentation, #announcements):**
1. Right-click channel → Edit Channel
2. Go to Permissions tab
3. @everyone: Allow **View Channel**, **Read Message History**
4. @everyone: Deny **Send Messages**
5. Admin role: Allow **Send Messages** (so admins can post)

**For all other channels:**
- Keep standard: View, Send, Read History allowed

### Step 2.3: Private Channels (Optional)

If you want certain channels restricted to specific roles:
1. Create role (e.g., "Developers" for #dev-tracking)
2. In channel Permissions: @everyone Deny "View Channel"
3. Add role: Allow "View Channel"

---

## 📌 Phase 3: Deploy Bot Code

### Step 3.1: Push Code Changes

```bash
cd /home/needaimdark/Desktop/mcp-bot
git add -A
git commit -m "feat: add channel organization and restrictions"
git push origin main
```

### Step 3.2: Redeploy on Render

1. Go to Render.com dashboard
2. Find your MCP Bot service
3. Deploy will auto-trigger (or manually trigger)
4. Wait for deployment to complete (5-10 minutes)

### Step 3.3: Verify Deployment

```bash
# Test the bot responds
curl https://your-render-url/health 2>/dev/null | head -20
```

---

## 🛠️ Phase 4: Generate Channel Info Messages

### Step 4.1: Run Channel Setup in Each Channel

Go to each channel and run the command:

**In #daily-tasks:**
```
/channel-setup action: info
```

**In #team:**
```
/channel-setup action: info
```

**In #dev-tracking:**
```
/channel-setup action: info
```

**In #chat-with-ia:**
```
/channel-setup action: info
```

**In #mcp-learning:**
```
/channel-setup action: info
```

**In #general:**
```
/channel-setup action: info
```

**In #documentation:**
```
/channel-setup action: guide
```

This generates pretty embeds showing which commands work in each channel.

### Step 4.2: Pin the Messages

For each message the bot sent:
1. Right-click message
2. Select "Pin Message"
3. Confirm

Users will see 📌 icon in channel, showing pinned guides.

---

## ✅ Phase 5: Verification & Testing

### Step 5.1: Test Each Command

**In #daily-tasks:**
```
✅ Test: /task-completed task_name: Test
✅ Test: /today-plan
✅ Test: /yesterday-summary
```

**In #team:**
```
✅ Test: /team-stats
✅ Test: /view-streak
✅ Test: /leaderboard
```

**In #dev-tracking:**
```
✅ Test: /dev-update project: Career task_category: feature description: Test
✅ Test: /team-progress
```

**In #chat-with-ia:**
```
✅ Test: /chat (creates new private channel)
✅ In that new channel: /ask question: What is MCP?
```

**In #mcp-learning:**
```
✅ Test: /mcp-learn
✅ Test: /daily-tip
✅ Test: /challenge-solver problem: Test
✅ Test: /ai-insights
```

**In #general:**
```
✅ Test: /get-motivation
```

### Step 5.2: Test Wrong Channel (Should Fail)

**In #general, try:**
```
❌ Test: /dev-update (should fail with helpful message)
```

Should see error:
```
❌ Command Not Allowed Here

The command `/dev-update` cannot be used in 📍 General.

📍 Use This Command In:
🔨 Dev Tracking
```

### Step 5.3: Verify Channel Info

1. Open #daily-tasks
2. Look for pinned message 📌
3. Click to expand
4. Verify it lists: /yesterday-summary, /today-plan, /task-completed

Repeat for other channels.

---

## 📢 Phase 6: Team Communication

### Step 6.1: Post Announcement

Go to #announcements and post:

```
🎉 **NEW: Organized Channel Structure!**

We've reorganized the Discord to keep things organized and focused!

📍 Each channel now has specific commands:
• #daily-tasks - Track daily work
• #team - Team performance  
• #dev-tracking - Log MCP development
• #chat-with-ia - Private AI chats
• #mcp-learning - Learn MCP, get tips
• #general - Daily motivation
• #documentation - Guides and docs
• #announcements - Updates

🔍 **What to Do:**
1. Read pinned messages in each channel (📌)
2. Check command list for that channel
3. Use commands only in their designated channels
4. If confused, check #documentation

💡 **Why?**
This structure keeps conversations organized, makes it easy to find info, and helps new team members understand the bot quickly.

Questions? Ask in #mcp-learning or #chat-with-ia!

🚀 Let's go!
```

### Step 6.2: Send Onboarding to New Members

In #documentation, post:

```
👋 **Welcome to the MCP Bot Team!**

Here's how to get started:

1️⃣ **Read the pinned messages** in each channel (📌)
2️⃣ **Check your role** - what team are you on?
3️⃣ **Start using commands** in the right channels
4️⃣ **Create a private chat** with /chat if you have questions

📚 **Quick Guide:**
• Want to track your day? → #daily-tasks
• Want to see team progress? → #team
• Logging development work? → #dev-tracking
• Learning about MCP? → #mcp-learning
• Need AI help? → #chat-with-ia
• Need motivation? → #general

🎯 **First Steps:**
1. Go to #daily-tasks
2. Run: /today-plan
3. Go to #team
4. Run: /team-stats
5. Go to #mcp-learning
6. Run: /daily-tip

Good luck! 🚀
```

### Step 6.3: Conduct Brief Training (Optional)

Host a 10-minute meeting:
- Explain channel purpose
- Demo one command per channel
- Answer questions
- Show where to find help

---

## 🛠️ Phase 7: Ongoing Maintenance

### Weekly Tasks

- [ ] Monitor #announcements for any issues
- [ ] Check pinned messages are still visible
- [ ] Review usage patterns

### Monthly Tasks

- [ ] Gather team feedback
- [ ] Adjust channel structure if needed
- [ ] Update documentation if commands change
- [ ] Celebrate team achievements

### If Something Breaks

1. Check bot logs: `npm run logs` (if running locally)
2. Verify bot is still online (check Discord)
3. Try a simple command like `/test`
4. If still broken, redeploy bot
5. Clear Discord cache (Ctrl+Shift+Delete)

---

## 📚 Reference: Command Mapping

Keep this handy for reference:

```
DAILY TASKS CHANNEL:
  /yesterday-summary    - AI summary of yesterday's work
  /today-plan          - Plan today with AI suggestions
  /task-completed      - Log a completed task

TEAM CHANNEL:
  /team-stats          - View team statistics
  /view-streak         - Check your streak counter
  /leaderboard         - See top performers

DEV TRACKING CHANNEL:
  /dev-update          - Log development progress
  /team-progress       - View team analytics

CHAT WITH IA CHANNEL:
  /chat                - Create private AI session
  /ask                 - Ask MCP questions

MCP LEARNING CHANNEL:
  /mcp-learn           - Learning resources
  /daily-tip           - Educational tips
  /challenge-solver    - Solve technical problems
  /ai-insights         - Team insights

GENERAL CHANNEL:
  /get-motivation      - Daily motivation

DOCUMENTATION CHANNEL:
  (no commands, info only)

ANNOUNCEMENTS CHANNEL:
  (no commands, admin updates only)
```

---

## ✨ Success Indicators

You'll know setup was successful when:

✅ All 8 channels exist with correct names  
✅ Pinned messages show in each channel  
✅ Commands work in correct channels only  
✅ Wrong channel attempts show helpful errors  
✅ Team members understand channel purpose  
✅ Daily usage shows pattern matching structure  
✅ New members adopt quickly  
✅ Team reports better organization  

---

## 🆘 Troubleshooting

### Problem: Bot doesn't respond to commands

**Solution:**
1. Verify bot is still in the server (check member list)
2. Check bot has "Send Messages" permission in channel
3. Try `/test` command
4. Check Render deployment status

### Problem: Commands work but aren't restricted

**Solution:**
1. Redeploy bot (make sure changes pushed)
2. Wait 5 minutes for Discord to cache
3. Try in different browser/incognito mode
4. Clear Discord cache

### Problem: Can't pin messages

**Solution:**
1. Check you have "Manage Messages" permission
2. Try in a different channel
3. Check message isn't already pinned
4. Try again in 30 seconds

### Problem: Team not using correct channels

**Solution:**
1. Post reminder in #announcements
2. Host quick training session
3. Update #documentation with FAQ
4. Have team lead model correct usage

---

## 📞 Support

- **For Code Issues**: Check `src/services/channelGuard.js`
- **For Configuration**: Update `src/services/channelGuard.js` and redeploy
- **For User Questions**: Post in #documentation or #mcp-learning
- **For Admin Help**: Create issue in project repo

---

## 🎓 Next Steps

After setup is complete:

1. **Monitor Usage** - See which channels are active
2. **Gather Feedback** - Ask team what's working
3. **Refine** - Adjust based on feedback
4. **Scale** - Add more commands or channels as needed
5. **Document** - Keep #documentation updated

---

**Created**: May 7, 2026  
**Version**: 1.0  
**Status**: Ready to implement  

**Estimated Time to Complete**: 30-45 minutes  
**Difficulty**: Easy to Medium  
**No coding required for server admin!**

Good luck! 🚀

