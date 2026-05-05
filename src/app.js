import 'dotenv/config';
import express from 'express';
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { CONSTANTS } from './constants.js';
import mongodbService from './services/mongodbService.js';
import groqService from './services/groqService.js';
import logger from './services/logger.js';
import { handleCommand } from './commands.js';
import { handleDevUpdate } from './commands/devUpdate.js';
import { handleMcpLearn } from './commands/mcpLearn.js';
import { handleTeamProgress } from './commands/teamProgress.js';
import { handleDailyTip } from './commands/dailyTip.js';
import { handleChallengeSolver } from './commands/challengeSolver.js';
import { handleAiInsights } from './commands/aiInsights.js';
import { handleChat } from './commands/chat.js';
import { handleChatMessage } from './handlers/chatMessageHandler.js';
import { handleAsk } from './commands/ask.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands/handling-user-commands for more info
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // Route to MCP development commands
    if (name === 'dev-update') {
      return await handleDevUpdate(req, res);
    }
    if (name === 'mcp-learn') {
      return await handleMcpLearn(req, res);
    }
    if (name === 'team-progress') {
      return await handleTeamProgress(req, res);
    }
    if (name === 'daily-tip') {
      return await handleDailyTip(req, res);
    }
    if (name === 'challenge-solver') {
      return await handleChallengeSolver(req, res);
    }
    if (name === 'ai-insights') {
      return await handleAiInsights(req, res);
    }
    if (name === 'chat') {
      return await handleChat(req, res);
    }
    if (name === 'ask') {
      return await handleAsk(req, res);
    }

    // Route to daily tracking commands
    if (['task-completed', 'yesterday-summary', 'today-plan', 'get-motivation', 'team-stats', 'view-streak', 'leaderboard'].includes(name)) {
      return await handleCommand(req, res, name);
    }

    // "test" command (legacy)
    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }


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
