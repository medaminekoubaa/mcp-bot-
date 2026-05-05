# Testing Guide - Discord Bot Services

Complete step-by-step guide to test all components before moving forward.

---

## ⚡ Quick Start Testing

### Step 1: Install Dependencies
```bash
cd /home/needaimdark/Desktop/discord-example-app
npm install
```

This installs:
- `discord-interactions` - Discord API helper
- `dotenv` - Environment variables
- `express` - Web framework
- `mongodb` - Database driver
- `node-fetch` - HTTP requests

---

### Step 2: Start MongoDB

**Option A: Local MongoDB (Recommended for Testing)**

```bash
# Start MongoDB service
sudo systemctl start mongod

# Verify it's running
mongosh --version

# Quick test - connect to MongoDB
mongosh
# You should see: "Connecting to: mongodb://localhost:27017/?directConnection=true"
# Type: exit
```

**Option B: MongoDB Atlas (Cloud)**
- Update `MONGODB_URI` in `.env`
- Ensure your IP is whitelisted

---

### Step 3: Run the Test Suite

```bash
npm run test
```

This runs `node test.js` which tests:
- ✅ Constants & Configuration
- ✅ Logger Service
- ✅ Data Validation
- ✅ Groq API Service
- ✅ MongoDB Service

**Expected Output:**
```
🧪 DISCORD BOT SERVICE TEST SUITE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. CONSTANTS & CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Constants file loads successfully... ✓ PASS
  Groq API keys are configured... ✓ PASS
  System prompts are defined... ✓ PASS
  Command definitions exist... ✓ PASS
  Database collections are configured... ✓ PASS

[... more tests ...]

🎉 ALL TESTS PASSED! Ready for development.
```

---

## 📋 Manual Testing Checklist

### 1. Environment Variables
- [ ] Check `.env` file has all 4 Groq API keys
- [ ] Check `MONGODB_URI` is correct
- [ ] Check Discord credentials are present

```bash
cat .env
```

### 2. File Structure
- [ ] `constants.js` exists
- [ ] `services/groqService.js` exists
- [ ] `services/mongodbService.js` exists
- [ ] `services/logger.js` exists
- [ ] `models/dataModels.js` exists
- [ ] `test.js` exists

```bash
ls -la *.js services/*.js models/*.js
```

### 3. Dependencies
- [ ] All npm packages installed

```bash
npm list | grep -E "discord-interactions|mongodb|dotenv|express|node-fetch"
```

### 4. MongoDB Connection
- [ ] MongoDB service running

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or try to connect
mongosh
# Should connect successfully
```

### 5. Test Results
- [ ] All tests pass
- [ ] No error messages

```bash
npm run test
```

---

## 🧪 Individual Service Tests

### Test Groq API Service Only

```bash
node -e "
import groqService from './services/groqService.js';
console.log('Groq Status:', groqService.getStatus());
"
```

Expected output:
```javascript
Groq Status: {
  totalKeys: 4,
  currentKeyIndex: 1,
  cacheSize: 0,
  quotaErrors: []
}
```

---

### Test MongoDB Connection Only

```bash
node -e "
import mongodbService from './services/mongodbService.js';
(async () => {
  try {
    await mongodbService.connect();
    console.log('✅ MongoDB Connected');
    console.log('Connected:', mongodbService.isConnected());
    await mongodbService.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch(e) {
    console.error('❌ MongoDB Error:', e.message);
  }
})();
"
```

Expected output:
```
[MongoDB] Connecting to database...
✅ MongoDB Connected
Connected: true
✅ MongoDB Disconnected
```

---

### Test Logger Service Only

```bash
node -e "
import logger from './services/logger.js';
logger.info('TEST', 'This is an info message');
logger.warn('TEST', 'This is a warning', {context: 'test'});
logger.error('TEST', 'This is an error message');
"
```

Expected output:
```
[2026-05-05T...] [INFO] [TEST] This is an info message
[2026-05-05T...] [WARN] [TEST] This is a warning { context: 'test' }
[2026-05-05T...] [ERROR] [TEST] This is an error message
```

---

### Test Data Validation Only

```bash
node -e "
import { ValidationUtils } from './models/dataModels.js';

// Valid task
const task = { taskName: 'Test', category: 'coding' };
console.log('Valid Task:', ValidationUtils.validateTask(task));

// Invalid task (empty name)
const badTask = { taskName: '' };
console.log('Invalid Task:', ValidationUtils.validateTask(badTask));
"
```

Expected output:
```javascript
Valid Task: { isValid: true, errors: [] }
Invalid Task: { 
  isValid: false, 
  errors: [ 'Task name is required' ] 
}
```

---

## 🔍 Debugging Commands

### View Current Directory Structure
```bash
tree -L 2 -I 'node_modules'
```

### Check .env File
```bash
cat .env | grep -v "^#"
```

### View MongoDB Logs
```bash
sudo journalctl -u mongod -n 20
```

### Check Node Version
```bash
node --version
# Should be 18.x or higher
```

### Run Tests with Verbose Output
```bash
npm run test 2>&1 | tee test-output.log
```

---

## 🚨 Troubleshooting

### "MongoDB Connect ECONNREFUSED"
```bash
# MongoDB is not running
sudo systemctl start mongod
sudo systemctl status mongod
```

### "Cannot find module 'mongodb'"
```bash
# Dependencies not installed
npm install
npm list mongodb
```

### "Invalid or missing Groq API key"
```bash
# Check .env file
cat .env | grep GROQ_API_KEY

# Verify it's exactly as provided (no extra spaces)
```

### "Tests timing out"
```bash
# Increase timeout
npm run test -- --timeout 30000
```

### "Permission denied on MongoDB"
```bash
# Check MongoDB service status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

---

## ✅ Success Criteria

The system is ready to move forward when:

- [x] All 25+ tests pass
- [x] MongoDB connects and disconnects successfully  
- [x] All services initialize without errors
- [x] Logger outputs colored messages
- [x] Validation utilities work correctly
- [x] Groq service shows all 4 API keys
- [x] No critical errors in test output

---

## 📊 What Each Test Validates

| Test Category | Tests | Purpose |
|---|---|---|
| **Constants** | 5 | Verify all configuration loaded |
| **Logger** | 3 | Verify logging system works |
| **Validation** | 3 | Verify data validation rules |
| **Groq** | 5 | Verify AI service initialized |
| **MongoDB** | 7+ | Verify database operations |

---

## 🎯 Next Steps After Testing

Once all tests pass:
1. Create daily tracking commands
2. Implement Groq AI integration for responses
3. Build motivation/tips feature
4. Add voice channel support
5. Integrate into main bot
6. Run full bot test

---

## 📝 Notes

- Tests use test data that's automatically cleaned up
- MongoDB collections are created on first write
- Groq service uses caching, so repeated tests are faster
- All logs are timestamped and color-coded
- Tests can be run multiple times safely
