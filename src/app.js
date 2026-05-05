import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { CONSTANTS } from './constants.js';
import mongodbService from './services/mongodbService.js';
import groqService from './services/groqService.js';
import logger from './services/logger.js';
import { handleCommand } from './commands.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};

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

    // "challenge" command (legacy - rock paper scissors)
    if (name === 'challenge') {
      const userId = req.body.member.user.id;
      activeGames[userId] = {};

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'rock paper scissors!',
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  custom_id: 'accept_challenge',
                  options: getShuffledOptions(),
                },
              ],
            },
          ],
        },
      });
    }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-component-interactions
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;

    if (componentId.startsWith('accept_challenge')) {
      // get the selected value from the first action row's select menu
      const userId = req.body.member.user.id;
      const playerChoice = data.values[0];

      // Correct format with file extension
      const guildId = req.body.guild_id;
      const channelId = req.body.channel_id;
      const gameId = req.body.id;

      // Delete message with token in request body
      const endpoint = `webhooks/${req.body.application_id}/${req.body.token}/messages/${gameId}`;
      try {
        await DiscordRequest(endpoint, { method: 'DELETE' });
      } catch (err) {
        console.error('Error deleting message:', err);
      }

      // Determine bot choice
      const botChoice = getResult(playerChoice);

      // Calculates tie/win/loss
      const resultValue = getResult(botChoice, playerChoice);

      // Respond by sending ephemeral message with user's choice data
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Ephemeral message (only visible to user)
          flags: InteractionResponseFlags.EPHEMERAL,
          embeds: [
            {
              title: 'Nice!',
              description: `You chose **${playerChoice}**\n${botChoice !== playerChoice ? `I chose **${botChoice}**` : 'I did the same!'}`,
              color: 0x00acee,
            },
            {
              title: resultValue === 1 ? 'You won! 🎉' : resultValue === -1 ? 'You lost 😔' : "It's a tie! 🤝",
              color: resultValue === 1 ? 0x92a8d1 : resultValue === -1 ? 0xff6961 : 0xf69541,
            },
          ],
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
