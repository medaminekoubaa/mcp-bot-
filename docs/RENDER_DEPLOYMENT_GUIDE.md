# 🚀 Deploy mcp-bot to Render - Complete Guide

**Total Time: ~10 minutes**  
**Cost: $0/month** ✅

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **GitHub Account** with mcp-bot repository pushed (you have this!)
- ✅ **MongoDB Connection String** from MongoDB Atlas
  - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mcp-bot?retryWrites=true&w=majority`
- ✅ **Discord Bot Token** (from Discord Developer Portal)
- ✅ **Discord App ID** 
- ✅ **Discord Public Key**
- ✅ **4x Groq API Keys**

---

## Step 1️⃣: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started"** (top right)
3. Click **"Sign up with GitHub"**
4. Authorize Render to access your GitHub
5. Verify email (check inbox)

✅ Render account created!

---

## Step 2️⃣: Create Web Service on Render

1. After login, click **"New +"** (top left) → **"Web Service"**
2. Choose **"Connect a repository"** → Select `mcp-bot` repository
3. Click **"Connect"**

### Configure the Web Service:

**Basic Settings:**
- **Name**: `mcp-bot` (or any name you like)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan:**
- Select **"Free"** (bottom option) ✅

---

## Step 3️⃣: Add Environment Variables

This is crucial! Render needs all your secrets as environment variables.

1. In Render dashboard, under your service, go to **"Environment"**
2. Click **"Add Environment Variable"** and add these:

```
APP_ID=<your_discord_app_id>
DISCORD_TOKEN=<your_discord_bot_token>
PUBLIC_KEY=<your_discord_public_key>
GROQ_API_KEY_1=<groq_key_1>
GROQ_API_KEY_2=<groq_key_2>
GROQ_API_KEY_3=<groq_key_3>
GROQ_API_KEY_4=<groq_key_4>
MONGODB_URI=mongodb+srv://mcp_bot_user:PASSWORD@cluster0.xxxxx.mongodb.net/mcp-bot?retryWrites=true&w=majority
PORT=3000
LOG_LEVEL=INFO
NODE_ENV=production
ENABLE_CONSOLE_LOG=true
```

**⚠️ IMPORTANT:**
- Replace `<your_discord_app_id>` with actual value
- Replace `PASSWORD` in MongoDB URI with your actual password
- Replace `cluster0.xxxxx` with your MongoDB cluster URL

---

## Step 4️⃣: Update Discord Bot URL

Your bot needs to know where to send interactions. Update your Discord Bot settings:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot app
3. Go to **"General Information"** → **"Interactions Endpoint URL"**
4. After deployment, Render will give you a URL like: `https://mcp-bot-xxxxx.onrender.com`
5. Set Interactions Endpoint URL to: `https://mcp-bot-xxxxx.onrender.com/interactions`
6. Click **"Save Changes"**

---

## Step 5️⃣: Deploy!

1. Back on Render dashboard, click **"Deploy"** button
2. Watch the logs in real-time (takes 2-3 minutes)
3. When you see "=== Your service is live ===" ✅ Deployment successful!

---

## Step 6️⃣: Verify Deployment

### Check Bot Status:
```bash
# The bot should be online in Discord
# Try using one of the commands: /task-completed, /today-plan, etc.
```

### Check Logs:
- In Render dashboard, click **"Logs"** tab
- You should see connection messages

### Common Log Messages:
```
✅ Bot is online and ready!
✅ Connected to MongoDB
✅ All 7 commands registered
```

---

## ❌ Troubleshooting

### "Service is crashing"
- Check **"Logs"** tab for errors
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is valid

### "Bot not responding to commands"
- Check **Interactions Endpoint URL** is set correctly in Discord Developer Portal
- Bot should show as "Online" in Discord
- Try using `/help` command

### "MongoDB connection failed"
- Verify connection string format
- Check MongoDB Atlas IP whitelist includes: `0.0.0.0/0` (or Render's IP)
- Ensure username/password in connection string are correct

### View Full Logs:
```bash
# Render shows logs in dashboard, but you can also use:
# The service URL will be: https://mcp-bot-xxxxx.onrender.com
# Check: https://mcp-bot-xxxxx.onrender.com/health (if available)
```

---

## 🎉 You're Done!

Your mcp-bot is now:
- ✅ Running on Render (free tier)
- ✅ Connected to MongoDB Atlas (free tier)
- ✅ Available 24/7
- ✅ Completely free!

### Next Steps:
1. Test commands in your Discord server
2. Monitor logs for any issues
3. Update deployment as needed

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_ID` | Discord App ID | `1234567890` |
| `DISCORD_TOKEN` | Bot token | `MTk4N...` |
| `PUBLIC_KEY` | Interactions public key | `abc123...` |
| `GROQ_API_KEY_*` | Groq API keys (4 total) | `gsk_...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `production` |

---

## 📚 Additional Resources

- **Render Docs**: https://docs.render.com/
- **Discord Developer Portal**: https://discord.com/developers/applications
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Groq API**: https://console.groq.com

