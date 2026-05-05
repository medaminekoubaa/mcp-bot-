# 🚀 Quick Deploy Checklist (5 Minutes)

## ✅ Before You Deploy

- [ ] Read [docs/DEPLOY_FREE.md](DEPLOY_FREE.md)
- [ ] Have Discord Bot TOKEN ready
- [ ] Have 4x Groq API keys ready
- [ ] Have 10-15 minutes free

## 🗂️ Quick Setup Steps

### Step 1: Create MongoDB Atlas (5 min)
```
mongodb.com/cloud/atlas
  → Sign Up
  → Create Shared Cluster (FREE)
  → Create Database User
  → Copy Connection String
  → Save it! 📋
```

### Step 2: Prepare Environment Variables (2 min)
Get these values ready:
```
APP_ID = [Discord Developer Portal → General Information]
DISCORD_TOKEN = [Discord Developer Portal → Bot → TOKEN]
PUBLIC_KEY = [Discord Developer Portal → General Information]
GROQ_API_KEY_1 = [from your console]
GROQ_API_KEY_2 = [from your console]
GROQ_API_KEY_3 = [from your console]
GROQ_API_KEY_4 = [from your console]
MONGODB_URI = [from MongoDB Atlas - UPDATE THE PASSWORD]
```

### Step 3: Deploy on Render (5 min)
```
render.com
  → Sign Up
  → Create Web Service
  → Add environment variables (paste all above)
  → Deploy
```

### Step 4: Register Commands (1 min)
Run locally:
```bash
npm run register
```

### Step 5: Update Discord Webhook (1 min)
```
Discord Developer Portal
  → Your App
  → General Information
  → Interactions Endpoint URL
  → Set to: https://YOUR_RENDER_URL/interactions
  → Save
```

### Step 6: Test in Discord (1 min)
```
/task-completed
  → Should work! 🎉
```

---

## 🆘 Stuck?

1. **MongoDB Connection Failed?**
   - MongoDB Atlas → Security → Network Access
   - Add IP 0.0.0.0/0
   - Wait 1 minute

2. **Discord Verify Failed?**
   - Check PUBLIC_KEY matches exactly
   - Check .env has all required variables

3. **Can't Deploy?**
   - Check npm start works locally: `npm start`
   - Check all dependencies installed: `npm install`
   - Read full guide: docs/DEPLOY_FREE.md

---

## 💾 Important Files

After deployment setup:
- `.env` - Local development (KEEP SECRET ⚠️)
- `.env.sample` - Template for Render env variables
- `docs/DEPLOY_FREE.md` - Full step-by-step guide

---

## ✅ You're Ready!

Your mcp-bot will be live and completely FREE forever 🎉

Total cost: **$0/month**
Deployment time: **~15 min**
Maintenance: **None (fully managed)**

Let's go! 🚀

