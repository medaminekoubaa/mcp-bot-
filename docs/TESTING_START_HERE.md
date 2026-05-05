# 🧪 Complete Testing Workflow

This file guides you through testing all the services we've built.

---

## 📋 Testing Checklist

### Before Running Tests

- [ ] You have all 4 Groq API keys
- [ ] You have Discord bot credentials (APP_ID, TOKEN, PUBLIC_KEY)
- [ ] Node.js 18+ is installed
- [ ] MongoDB is ready (local or Atlas)

---

## 🚀 Step-by-Step Testing Guide

### **Step 1: Check Prerequisites**

```bash
cd /home/needaimdark/Desktop/discord-example-app

# Run the prerequisites checker
bash check-prerequisites.sh
```

**Expected Output:**
```
🔍 DISCORD BOT - PREREQUISITES CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Node.js installed
  → v24.12.0
✓ npm installed
✓ .env file exists
✓ Groq API Key 1 configured
✓ Groq API Key 2 configured
✓ Groq API Key 3 configured
✓ Groq API Key 4 configured
✓ MongoDB URI configured
✓ Discord token configured
✓ constants.js exists
✓ services/groqService.js exists
✓ services/mongodbService.js exists
✓ services/logger.js exists
✓ models/dataModels.js exists
✓ test.js exists
✓ node_modules directory exists
✓ All npm packages installed
✓ MongoDB service is running

✅ All prerequisites met! Ready to test.
Run: npm run test
```

---

### **Step 2: Install Dependencies** (if not already done)

```bash
npm install
```

**What's installed:**
- discord-interactions (Discord API)
- mongodb (Database driver)
- dotenv (Environment variables)
- express (Web framework)
- node-fetch (HTTP client)

---

### **Step 3: Start MongoDB**

**Option A: Local MongoDB**
```bash
# Start the service
sudo systemctl start mongod

# Verify it's running
sudo systemctl status mongod

# You should see: ● mongod.service - MongoDB Server
#               Loaded: loaded
#               Active: active (running)
```

**Option B: MongoDB Atlas (Cloud)**
- Go to: https://www.mongodb.com/cloud/atlas
- Create free cluster (M0)
- Get connection string
- Update `MONGODB_URI` in `.env`:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/discord-bot
  ```

---

### **Step 4: Run the Full Test Suite**

```bash
npm run test
```

This runs 25+ automated tests covering:

#### **1. Constants & Configuration (5 tests)**
- ✅ Constants file loads
- ✅ Groq API keys configured
- ✅ System prompts defined
- ✅ Commands defined
- ✅ Database collections defined

#### **2. Logger Service (3 tests)**
- ✅ Logger initializes
- ✅ Logger methods exist
- ✅ Logger outputs formatted messages

#### **3. Data Validation (3 tests)**
- ✅ Valid tasks pass validation
- ✅ Invalid tasks fail validation
- ✅ Achievements validate correctly

#### **4. Groq API Service (5 tests)**
- ✅ Service initializes
- ✅ API keys available
- ✅ Key rotation works
- ✅ Service status available
- ✅ Cache methods work

#### **5. MongoDB Service (7+ tests)**
- ✅ Service initializes
- ✅ Connects to database
- ✅ Collections exist
- ✅ Can log activities
- ✅ Can add tasks
- ✅ Can retrieve tasks
- ✅ Can record achievements
- ✅ Can retrieve achievements
- ✅ Can calculate points
- ✅ Can get team stats
- ✅ Disconnects properly

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. LOGGER SERVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Logger initializes correctly... ✓ PASS
  Logger methods exist... ✓ PASS
  Logger outputs formatted messages... ✓ PASS

[... more test sections ...]

TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Tests: 28
  ✓ Passed: 28
  ✗ Failed: 0
  Success Rate: 100%

🎉 ALL TESTS PASSED! Ready for development.
```

---

## 🧪 Individual Component Tests

### Test Just the Constants
```bash
node -e "import { CONSTANTS } from './constants.js'; console.log('✅ Constants:', Object.keys(CONSTANTS));"
```

### Test Just Groq Service
```bash
node -e "
import groqService from './services/groqService.js';
console.log('✅ Groq Status:', groqService.getStatus());
"
```

### Test Just MongoDB
```bash
node -e "
import mongodbService from './services/mongodbService.js';
(async () => {
  try {
    await mongodbService.connect();
    console.log('✅ MongoDB Connected');
    const stats = await mongodbService.getTeamStats();
    console.log('✅ Team Stats:', stats);
    await mongodbService.disconnect();
  } catch(e) {
    console.error('❌ Error:', e.message);
  }
})();
"
```

### Test Just Logger
```bash
node -e "
import logger from './services/logger.js';
logger.info('TEST', 'This is a test message', {test: true});
logger.warn('TEST', 'Warning message');
logger.error('TEST', 'Error message');
console.log('✅ Logger works');
"
```

### Test Just Validation
```bash
node -e "
import { ValidationUtils } from './models/dataModels.js';
const result = ValidationUtils.validateTask({taskName: 'Test', category: 'coding'});
console.log('✅ Validation:', result);
"
```

---

## 🔍 Viewing Test Results

### Save test output to file
```bash
npm run test > test-results.log 2>&1
cat test-results.log
```

### Check if specific component passed
```bash
npm run test | grep -A2 "MongoDB Service"
```

### View only failures
```bash
npm run test | grep "FAIL"
```

---

## 🚨 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
```bash
# Start MongoDB
sudo systemctl start mongod

# Verify it's running
sudo systemctl status mongod

# Or use MongoDB Atlas - update .env with connection string
```

### API Key Error
```
Error: No Groq API keys configured
```
**Solution:**
```bash
# Check .env file
cat .env | grep GROQ

# Make sure all 4 keys are present and have correct format
```

### Module Not Found
```
Error: Cannot find module 'mongodb'
```
**Solution:**
```bash
# Install dependencies
npm install

# Verify installation
npm list mongodb
```

### Tests Timeout
```
Error: Timeout waiting for connection
```
**Solution:**
```bash
# MongoDB might be slow, increase timeout
# Edit test.js and increase timeout value
# Or restart MongoDB:
sudo systemctl restart mongod
```

---

## ✅ Success Criteria

You're ready to proceed when:

- [ ] All 25+ tests pass (100% success rate)
- [ ] No red "FAIL" messages
- [ ] MongoDB connected and disconnected properly
- [ ] Groq service shows all 4 API keys
- [ ] Logger outputs colored messages
- [ ] Validation utilities work correctly
- [ ] Test summary shows: `🎉 ALL TESTS PASSED!`

---

## 📊 What We're Testing

| Component | Tests | Validates |
|-----------|-------|-----------|
| Constants | 5 | Config loaded, all prompts/commands defined |
| Logger | 3 | Logging methods work, output formatted |
| Validation | 3 | Data schema validation rules |
| Groq | 5 | API keys, rotation, status, cache |
| MongoDB | 7+ | Connection, CRUD ops, aggregations |

---

## 🎯 After Testing Passes

Once all tests pass successfully:

1. **Move to Feature Development**
   - Build daily tracking commands
   - Implement AI response generation
   - Add motivation features

2. **Integration Testing**
   - Wire commands to Discord bot
   - Test with real Discord server
   - Verify Groq API responses

3. **Production Deployment**
   - Setup MongoDB Atlas for production
   - Configure production Groq keys
   - Deploy bot to cloud

---

## 📝 Test Log Example

See `docs/TESTING_GUIDE.md` for detailed manual testing steps and individual service tests.

Run tests with: `npm run test`
Check prerequisites with: `bash check-prerequisites.sh`
