# ⚡ Quick Action - GitHub to Render in 3 Steps

## 🎯 Your Status

✅ SSH Key Generated  
✅ Project Ready  
✅ GitHub Repo Created (git@github.com:medaminekoubaa/mcp-bot-.git)  

---

## 3️⃣ Steps to Deploy

### STEP 1: Add SSH Key to GitHub (2 min)

```
1. Go to: https://github.com/settings/keys
2. Click: "New SSH Key"
3. Title: mcp-bot-deploy
4. Paste your SSH key from: SSH_KEY_SETUP.md
5. Click: "Add SSH Key"
```

### STEP 2: Push Code to GitHub (1 min)

```bash
cd /home/needaimdark/Desktop/mcp-bot
bash setup-github.sh
```

This will automatically:
- Initialize git
- Add all files
- Create commit
- Push to GitHub

### STEP 3: Deploy on Render (5-10 min)

```
1. Go to: https://dashboard.render.com
2. Click: "New +" → "Web Service"
3. Click: "Connect Repository"
4. Select your GitHub account
5. Select: medaminekoubaa/mcp-bot-
6. Set Build: npm install
7. Set Start: npm start
8. Add 9 environment variables (from GITHUB_RENDER_DEPLOYMENT.md)
9. Click: "Create Web Service"
```

---

## ✅ After Deployment

1. Wait for "Deploy successful" ✅
2. Copy your Render URL
3. Update Discord webhook URL (see guide)
4. Run: `npm run register`
5. Test: `/task-completed` in Discord
6. Done! 🎉

---

## 📖 For Details

Read: [GITHUB_RENDER_DEPLOYMENT.md](GITHUB_RENDER_DEPLOYMENT.md)

(Full step-by-step with screenshots text)

---

## ⏱️ Total Time: ~20 minutes

**Let's go! 🚀**

