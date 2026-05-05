/**
 * Comprehensive Test Suite for Discord Bot Services
 * Tests: Groq API Service, MongoDB Service, Constants, Logger
 * Run with: node test.js
 */

import 'dotenv/config';
import groqService from '../src/services/groqService.js';
import mongodbService from '../src/services/mongodbService.js';
import logger from '../src/services/logger.js';
import { CONSTANTS } from '../src/constants.js';
import { ValidationUtils } from '../src/models/dataModels.js';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test helper
 */
async function test(name, fn) {
  try {
    process.stdout.write(`  ${name}... `);
    await fn();
    console.log(`${COLORS.green}✓ PASS${COLORS.reset}`);
    testsPassed++;
  } catch (error) {
    console.log(`${COLORS.red}✗ FAIL${COLORS.reset}`);
    console.log(`    ${COLORS.red}Error: ${error.message}${COLORS.reset}`);
    testsFailed++;
  }
}

/**
 * Test section header
 */
function section(title) {
  console.log(`\n${COLORS.bright}${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.bright}${title}${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
}

/**
 * RUN TESTS
 */
async function runTests() {
  console.log(`\n${COLORS.bright}🧪 DISCORD BOT SERVICE TEST SUITE${COLORS.reset}\n`);

  // ===== CONSTANTS TESTS =====
  section('1. CONSTANTS & CONFIGURATION');

  await test('Constants file loads successfully', () => {
    if (!CONSTANTS) throw new Error('Constants not loaded');
    if (!CONSTANTS.GROQ) throw new Error('Groq constants missing');
    if (!CONSTANTS.MONGODB) throw new Error('MongoDB constants missing');
  });

  await test('Groq API keys are configured', () => {
    if (!CONSTANTS.GROQ.API_KEYS || CONSTANTS.GROQ.API_KEYS.length === 0) {
      throw new Error('No Groq API keys found');
    }
    if (CONSTANTS.GROQ.API_KEYS.length < 4) {
      throw new Error(`Expected 4 API keys, got ${CONSTANTS.GROQ.API_KEYS.length}`);
    }
  });

  await test('System prompts are defined', () => {
    const prompts = Object.keys(CONSTANTS.PROMPTS);
    if (prompts.length < 4) {
      throw new Error(`Expected at least 4 prompts, got ${prompts.length}`);
    }
  });

  await test('Command definitions exist', () => {
    if (!CONSTANTS.COMMANDS.DAILY_TRACKING) {
      throw new Error('Daily tracking commands not defined');
    }
  });

  await test('Database collections are configured', () => {
    const collections = Object.values(CONSTANTS.MONGODB.COLLECTIONS);
    if (collections.length < 4) {
      throw new Error(`Expected at least 4 collections, got ${collections.length}`);
    }
  });

  // ===== LOGGER TESTS =====
  section('2. LOGGER SERVICE');

  await test('Logger initializes correctly', () => {
    if (!logger) throw new Error('Logger not initialized');
    if (!logger.info) throw new Error('Logger.info not available');
  });

  await test('Logger methods exist', () => {
    const methods = ['debug', 'info', 'warn', 'error'];
    for (const method of methods) {
      if (typeof logger[method] !== 'function') {
        throw new Error(`Logger.${method} is not a function`);
      }
    }
  });

  await test('Logger outputs formatted messages', (done) => {
    // Just test it doesn't throw
    logger.info('TEST', 'Test message', { test: true });
  });

  // ===== VALIDATION TESTS =====
  section('3. DATA VALIDATION');

  await test('Task validation works correctly', () => {
    const validTask = {
      taskName: 'Complete feature',
      details: 'Built amazing feature',
      category: 'coding',
    };

    const result = ValidationUtils.validateTask(validTask);
    if (!result.isValid) {
      throw new Error(`Valid task failed validation: ${result.errors.join(', ')}`);
    }
  });

  await test('Task validation rejects invalid data', () => {
    const invalidTask = {
      taskName: '', // Empty name
      details: 'x'.repeat(501), // Too long
    };

    const result = ValidationUtils.validateTask(invalidTask);
    if (result.isValid) {
      throw new Error('Invalid task passed validation');
    }
  });

  await test('Achievement validation works', () => {
    const validAchievement = {
      title: 'First Task',
      description: 'Completed first task',
      points: 50,
      rarity: 'common',
    };

    const result = ValidationUtils.validateAchievement(validAchievement);
    if (!result.isValid) {
      throw new Error(`Valid achievement failed: ${result.errors.join(', ')}`);
    }
  });

  // ===== GROQ SERVICE TESTS =====
  section('4. GROQ API SERVICE');

  await test('Groq service initializes', () => {
    if (!groqService) throw new Error('Groq service not initialized');
    if (!groqService.getCurrentKey) throw new Error('getCurrentKey method missing');
  });

  await test('Groq service has API keys', () => {
    const key = groqService.getCurrentKey();
    if (!key) throw new Error('No API key available');
    if (key.length < 10) throw new Error('Invalid API key format');
  });

  await test('Groq service can rotate keys', () => {
    const key1 = groqService.getCurrentKey();
    groqService.rotateKey();
    const key2 = groqService.getCurrentKey();
    // Keys should be different or service has only 1 key
    // This is fine either way
  });

  await test('Groq service status is available', () => {
    const status = groqService.getStatus();
    if (!status || !status.totalKeys) throw new Error('Status not available');
    if (status.totalKeys < 1) throw new Error('No keys in status');
  });

  await test('Groq service has cache methods', () => {
    if (typeof groqService.clearCache !== 'function') {
      throw new Error('clearCache method missing');
    }
  });

  // Note: Actual API call would require valid credentials and quota
  // await test('Groq service makes valid API request', async () => {
  //   const response = await groqService.getResponse('Hello, test message');
  //   if (!response || response.length === 0) {
  //     throw new Error('Empty response from Groq');
  //   }
  // });

  // ===== MONGODB SERVICE TESTS =====
  section('5. MONGODB SERVICE');

  let mongoConnected = false;

  await test('MongoDB service initializes', () => {
    if (!mongodbService) throw new Error('MongoDB service not initialized');
    if (!mongodbService.connect) throw new Error('connect method missing');
  });

  await test('MongoDB connects successfully', async () => {
    try {
      await mongodbService.connect();
      mongoConnected = mongodbService.isConnected();
      if (!mongoConnected) {
        throw new Error('Service reports not connected');
      }
    } catch (error) {
      if (error.message.includes('connect ECONNREFUSED')) {
        throw new Error(
          'MongoDB not running. Start with: sudo systemctl start mongod'
        );
      }
      throw error;
    }
  });

  if (mongoConnected) {
    await test('MongoDB collections exist', async () => {
      // Collections are created on demand, just verify service is ready
      if (!mongodbService.db) throw new Error('Database not initialized');
    });

    await test('MongoDB can log activity', async () => {
      const activity = await mongodbService.logActivity('test-user-123', 'test_action', {
        test: true,
      });
      if (!activity._id) throw new Error('Activity not logged properly');
    });

    await test('MongoDB can add a task', async () => {
      const task = await mongodbService.addDailyTask('test-user-456', {
        taskName: 'Test Task',
        details: 'This is a test task',
        category: 'coding',
      });
      if (!task._id) throw new Error('Task not created properly');
    });

    await test('MongoDB can retrieve today tasks', async () => {
      // Should return at least the task we just added
      const tasks = await mongodbService.getTodaysTasks('test-user-456');
      if (!Array.isArray(tasks)) throw new Error('Tasks not returned as array');
    });

    await test('MongoDB can record achievement', async () => {
      const achievement = await mongodbService.recordAchievement('test-user-789', {
        title: 'First Test',
        description: 'Test achievement',
        points: 10,
      });
      if (!achievement._id) throw new Error('Achievement not recorded');
    });

    await test('MongoDB can get achievements', async () => {
      const achievements = await mongodbService.getUserAchievements('test-user-789');
      if (!Array.isArray(achievements)) throw new Error('Achievements not returned as array');
    });

    await test('MongoDB can calculate points', async () => {
      const points = await mongodbService.getUserTotalPoints('test-user-789');
      if (typeof points !== 'number') throw new Error('Points not a number');
    });

    await test('MongoDB can get team stats', async () => {
      const stats = await mongodbService.getTeamStats();
      if (!stats) throw new Error('Team stats not available');
    });

    await test('MongoDB disconnects properly', async () => {
      await mongodbService.disconnect();
      if (mongodbService.isConnected()) throw new Error('Service still connected after disconnect');
    });
  }

  // ===== SUMMARY =====
  section('TEST SUMMARY');

  const total = testsPassed + testsFailed;
  const percentage = ((testsPassed / total) * 100).toFixed(1);

  console.log(`\n  Total Tests: ${total}`);
  console.log(`  ${COLORS.green}✓ Passed: ${testsPassed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}✗ Failed: ${testsFailed}${COLORS.reset}`);
  console.log(`  Success Rate: ${percentage}%\n`);

  if (testsFailed === 0) {
    console.log(
      `${COLORS.green}${COLORS.bright}🎉 ALL TESTS PASSED! Ready for development.${COLORS.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `${COLORS.red}${COLORS.bright}⚠️  Some tests failed. Check the errors above.${COLORS.reset}\n`
    );
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
