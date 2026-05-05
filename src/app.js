import 'dotenv/config';
import express from 'express';
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { CONSTANTS } from './constants.js';
import mongodbService from './services/mongodbService.js';
import groqService from './services/groqService.js';
import logger from './services/logger.js';
import rateLimiter from './services/rateLimiter.js';
import { handleCommand } from './commands.js';
import { handleDevUpdate } from './commands/devUpdate.js';
import { handleMcpLearn } from './commands/mcpLearn.js';
import { handleTeamProgress } from './commands/teamProgress.js';
import { handleDailyTip } from './commands/dailyTip.js';
import { handleChallengeSolver } from './commands/challengeSolver.js';
import { handleAiInsights } from './commands/aiInsights.js';
import { handleChat } from './commands/chat.js';
import { handleAsk } from './commands/ask.js';

const app = express();
const PORT = process.env.PORT || 3000;

const COMMAND_HANDLERS = {
  'dev-update': handleDevUpdate,
  'mcp-learn': handleMcpLearn,
  'team-progress': handleTeamProgress,
  'daily-tip': handleDailyTip,
  'challenge-solver': handleChallengeSolver,
  'ai-insights': handleAiInsights,
  'chat': handleChat,
  'ask': handleAsk,
  'task-completed': (req, res) => handleCommand(req, res, 'task-completed'),
  'yesterday-summary': (req, res) => handleCommand(req, res, 'yesterday-summary'),
  'today-plan': (req, res) => handleCommand(req, res, 'today-plan'),
  'get-motivation': (req, res) => handleCommand(req, res, 'get-motivation'),
  'team-stats': (req, res) => handleCommand(req, res, 'team-stats'),
  'view-streak': (req, res) => handleCommand(req, res, 'view-streak'),
  'leaderboard': (req, res) => handleCommand(req, res, 'leaderboard'),
};

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  try {
    const { id, type, data } = req.body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;
      const userId = req.body.member?.user?.id;

      if (userId) {
        const rateLimitCheck = rateLimiter.checkLimit(userId);
        if (!rateLimitCheck.allowed) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `⏳ Rate limit exceeded. Please try again in ${Math.ceil((rateLimitCheck.resetTime - new Date()) / 1000)} seconds.`,
              flags: 64,
            },
          });
        }
      }

      const handler = COMMAND_HANDLERS[name];
      if (handler) {
        logger.info('Bot', `Command executed: ${name}`, { userId });
        return await handler(req, res);
      }

      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'Test command works! 🤖' },
        });
      }

      logger.warn('Bot', `Unknown command: ${name}`);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unknown command: ${name}`,
          flags: 64,
        },
      });
    }

    logger.warn('Bot', `Unhandled interaction type: ${type}`);
  } catch (error) {
    logger.error('Bot', 'Interaction handler error', { message: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize services and start server
async function startBot() {
  try {
    // Connect to MongoDB
    await mongodbService.connect();
    
    // Log startup
    logger.info('Bot', 'Starting MCP Bot...');
    logger.info('Bot', 'Services initialized', {
      groqKeys: groqService.getStatus().totalKeys,
      mongodbConnected: mongodbService.isConnected(),
    });

    // Start Express server
    app.listen(PORT, () => {
      logger.info('Bot', `Express app listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Bot', 'Startup failed', { error: error.message });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Bot', 'Shutting down gracefully...');
  await mongodbService.disconnect();
  process.exit(0);
});

startBot();
