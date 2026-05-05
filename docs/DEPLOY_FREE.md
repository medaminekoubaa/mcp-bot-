# 🚀 Free Deployment Guide - Render + MongoDB Atlas

This guide will deploy your mcp-bot **completely free** using:
- **Render** - Free hosting platform (Web Service)
- **MongoDB Atlas** - Free 512MB cloud database
- **Total Cost: $0/month** ✅

---

## 📋 Prerequisites

✅ Discord Bot APP_ID & TOKEN (you have these)  
✅ 4x Groq API Keys (you have these)  
✅ This project (ready to deploy)  

---

## Step 1️⃣: Setup MongoDB Atlas (Free Cloud Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Sign Up"** (top right)
3. Enter email, password, agree to terms
4. Click **"Create account"**
5. Complete email verification

### 1.2 Create Free Cluster
1. After login, click **"Create"** button
2. Choose **"Shared"** cluster (FREE ✅)
3. Click **"Create Shared Cluster"**
4. Select cloud provider: **AWS**
5. Select region: Pick closest to you (e.g., **us-east-1** for US)
6. Click **"Create Cluster"** (takes 1-2 minutes)

### 1.3 Create Database User
1. Go to **"Security"** → **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `mcp_bot_user`
4. Password: Generate strong password (copy it!) 🔐
5. Click **"Add User"**

### 1.4 Get Connection String
1. Go to **"Deployment"** → **"Databases"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"** → **"Node.js"**
4. Copy the connection string (looks like):
```
mongodb+srv://mcp_bot_user:<password>@cluster0.xxxxx.mongodb.net/mcp-bot?retryWrites=true&w=majority
```
5. **Replace `<password>` with your actual password**
6. **Replace `/mcp-bot` with database name**

✅ **Save this URL - you'll need it in Render**

---

## Step 2️⃣: Prepare Project for Deployment

### 2.1 Update .env.sample
Create `.env.sample` so Render knows what variables are needed:

```env
APP_ID=your_app_id_here
DISCORD_TOKEN=your_token_here
PUBLIC_KEY=your_public_key_here
GROQ_API_KEY_1=key1_here
GROQ_API_KEY_2=key2_here
GROQ_API_KEY_3=key3_here
GROQ_API_KEY_4=key4_here
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mcp-bot
PORT=3000
LOG_LEVEL=INFO
ENABLE_CONSOLE_LOG=true
NODE_ENV=production
```

### 2.2 Check package.json
Your `package.json` should have:
```json
{
  "name": "mcp-bot",
  "version": "1.0.0",
  "description": "MCP Discord Bot for daily task tracking",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "register": "node src/register-commands.js",
    "test": "node tests/test.js"
  },
  "engines": {
    "node": "20.x"
  },
  "dependencies": {
    "discord-interactions": "^4.0.0",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mongodb": "^6.3.0",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 2.3 Create .gitignore (if deploying via Git)
```
node_modules/
.env
.env.local
.DS_Store
*.log
```

---

## Step 3️⃣: Deploy on Render (Two Options)

### Option A: Using Render Dashboard (Recommended - No Git Needed)

#### 3A.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** OR **"Email"**
4. Complete signup

#### 3A.2 Prepare Your Code
1. **Zip your project:**
```bash
cd /home/needaimdark/Desktop
zip -r mcp-bot.zip mcp-bot -x "mcp-bot/node_modules/*" "mcp-bot/.git/*"
```

2. This creates `mcp-bot.zip` (~500KB without node_modules)

#### 3A.3 Create Web Service on Render
1. Login to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Choose **"Public Git Repository"**
4. Click **"Deploy from a Git repository"**
5. For now, skip GitHub (we'll manually upload later)
6. Scroll to bottom, click **"Public Git Repository"**
7. Paste this temporary URL:
```
https://github.com/render-examples/express-hello-world.git
```
8. Click **"Connect"**

#### 3A.4 Configure the Service
**Name:** `mcp-bot`  
**Environment:** `Node`  
**Build Command:** `npm install`  
**Start Command:** `npm start`  
**Plan:** `Free`  

#### 3A.5 Set Environment Variables
1. Scroll down to **"Environment"**
2. Add each variable:
   - `APP_ID` = your Discord app ID
   - `DISCORD_TOKEN` = your Discord token
   - `PUBLIC_KEY` = your public key
   - `GROQ_API_KEY_1` = groq key 1
   - `GROQ_API_KEY_2` = groq key 2
   - `GROQ_API_KEY_3` = groq key 3
   - `GROQ_API_KEY_4` = groq key 4
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

3. Click **"Create Web Service"**

#### 3A.6 Deploy Your Code
1. After service is created, you'll see a dashboard
2. Click **"Connect Repository"** (or refresh to see options)
3. If no GitHub available, use **Render Shell**:
   - SSH into the deployment and upload files
   - Or deploy manually via their CLI

---

### Option B: Using Git from Command Line

#### 3B.1 Create Render Web Service
Same as 3A.3-3A.5 above

#### 3B.2 Deploy with Render CLI
```bash
# Install Render CLI (if available)
npm install -g @render-cli/cli

# Authenticate
render login

# Deploy
render deploy --service-id=YOUR_SERVICE_ID
```

---

## Step 4️⃣: Register Discord Commands

After deployment is running:

### 4.1 Get Your Render URL
- Go to Render dashboard
- Copy your service URL (looks like: `https://mcp-bot-xxxx.onrender.com`)

### 4.2 Update Discord App Settings
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your app
3. Go to **"General Information"** → **"Interactions Endpoint URL"**
4. Set to: `https://mcp-bot-xxxx.onrender.com/interactions`
5. Click **"Save Changes"**

### 4.3 Register Commands
Run this locally to register your commands:
```bash
cd /home/needaimdark/Desktop/mcp-bot
npm run register
```

---

## Step 5️⃣: Verify Deployment

### 5.1 Check Render Logs
1. Go to [render.com dashboard](https://dashboard.render.com)
2. Click your service name
3. Go to **"Logs"** tab
4. Look for:
   ```
   ✅ Server running on port 3000
   ✅ MongoDB connected
   ```

### 5.2 Test in Discord
1. Go to your Discord server
2. Try `/task-completed`
3. Should work immediately! 🎉

### 5.3 If It Fails
Check Render logs for errors:
- **MongoDB Connection Error** → Check connection string in .env
- **Discord Verify Failed** → Check PUBLIC_KEY
- **Port Issues** → Verify PORT=3000 in env

---

## 🛑 Troubleshooting

### Issue: "MongoDB connection timeout"
**Solution:** 
- Check MongoDB Atlas IP whitelist
- Go to MongoDB Atlas → Security → Network Access
- Click "Add IP Address"
- Select "Allow access from anywhere" (0.0.0.0/0) ⚠️
- Click "Confirm"

### Issue: "Discord signature verification failed"
**Solution:**
- Verify PUBLIC_KEY in .env matches Discord app settings
- Go to Discord Developer Portal → Your App → General Information
- Copy PUBLIC_KEY exactly

### Issue: "Render keeps crashing"
**Solution:**
- Check `npm start` command works locally: `npm start`
- Verify all dependencies in package.json
- Check logs: Render Dashboard → Logs tab

### Issue: "Commands not showing in Discord"
**Solution:**
- Run `npm run register` from your local machine
- Wait 30 seconds for Discord cache to clear
- Reload Discord client

---

## 📊 Free Tier Limits

| Service | Limit | Status |
|---------|-------|--------|
| Render | 0.5 GB RAM | ✅ Enough for mcp-bot |
| Render | 100GB bandwidth/month | ✅ Plenty for bot |
| MongoDB Atlas | 512 MB storage | ✅ Good for starting |
| MongoDB Atlas | Shared cluster | ✅ Free tier |

Your mcp-bot will use **~50-100MB** on MongoDB, so you're well within limits! 🎉

---

## 🚀 You're Live!

Your bot is now:
✅ Running 24/7 on Render  
✅ Using MongoDB Atlas cloud database  
✅ Registered Discord slash commands  
✅ Zero monthly cost  
✅ Production-ready  

---

## 📝 Important Notes

⚠️ **Free tier sleep:** Render free services sleep after 15 mins of inactivity  
✅ **Solution:** Tasks will still work when called - no data loss  

⚠️ **MongoDB auto-delete:** Atlas free tier data kept indefinitely  
✅ **Solution:** Your task data is safe forever  

✅ **Need to scale?** Both Render and MongoDB have affordable paid tiers

---

## Next Steps

1. ✅ Setup MongoDB Atlas (Step 1)
2. ✅ Prepare project (Step 2)
3. ✅ Deploy on Render (Step 3)
4. ✅ Register Discord commands (Step 4)
5. ✅ Test in Discord (Step 5)

**Time to deploy:** ~15-20 minutes ⏱️

**Questions?** Check logs in Render dashboard!

