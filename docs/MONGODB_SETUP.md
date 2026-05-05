# MongoDB Setup Guide

## Option 1: Local MongoDB Setup (Recommended for Development)

### On Linux (Ubuntu/Debian)
```bash
# Install MongoDB Community Server
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongosh --version
```

### On macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify installation
mongosh --version
```

### On Windows
- Download: https://www.mongodb.com/try/download/community
- Run the installer
- Follow the installation wizard
- MongoDB will start automatically

### Verify Connection
```bash
# Connect to MongoDB shell
mongosh

# You should see something like:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://localhost:27017/?directConnection=true
```

---

## Option 2: MongoDB Atlas Cloud Setup (Recommended for Production)

### Steps
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 free tier)
4. Set up database access (username/password)
5. Add your IP to the whitelist (0.0.0.0/0 for dev)
6. Get your connection string

### Update .env
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/discord-bot?retryWrites=true&w=majority
```

---

## Project Setup

After installing MongoDB:

```bash
# Install dependencies (including MongoDB driver)
npm install

# Start your bot
npm start
```

The bot will automatically:
- Connect to MongoDB
- Create necessary indexes
- Initialize collections

---

## Database Collections

The bot uses these collections automatically:

- **daily_tasks** - Logs of completed tasks
- **user_activity** - User interaction logs (auto-cleanup after 30 days)
- **achievements** - Unlocked achievements
- **team_stats** - Team statistics

---

## Development Tips

### Check database in Mongo Shell
```bash
# Connect to database
mongosh

# Use the database
use discord-bot

# List collections
show collections

# View a document
db.daily_tasks.findOne()

# Count documents
db.daily_tasks.countDocuments()

# Clear a collection (caution!)
db.daily_tasks.deleteMany({})
```

### Monitor Connections
The service uses:
- **Min Pool Size**: 2 connections
- **Max Pool Size**: 10 connections
- **Timeout**: 10 seconds

---

## Troubleshooting

### "Connect to MongoDB failed"
✅ Check if MongoDB is running: `sudo systemctl status mongod`
✅ Verify connection string in .env
✅ If using Atlas, whitelist your IP

### "Authentication failed"
✅ Verify username/password for Atlas
✅ Check if special characters need URL encoding

### "No such file or directory"
✅ MongoDB might not be installed properly
✅ Reinstall using the commands above
