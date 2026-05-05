/**
 * MCP Learn Command Handler
 * Implements /mcp-learn command for learning resources
 */

import { InteractionResponseType } from 'discord-interactions';
import logger from '../services/logger.js';

/**
 * Handle /mcp-learn command
 */
export async function handleMcpLearn(req, res) {
  try {
    const username = req.body.member.user.username;
    const { options } = req.body.data;

    const category = options?.find(o => o.name === 'category')?.value || 'mcp';
    const difficulty = options?.find(o => o.name === 'difficulty')?.value || 'beginner';

    logger.info('Commands/MCP', 'Learning resource requested', { username, category, difficulty });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: '📚 MCP Learning Resource',
            description: `Learning material for ${category.toUpperCase()} at ${difficulty} level`,
            color: 0x9b59b6,
            fields: [
              {
                name: '📖 Topic',
                value: `Category: ${category}\nDifficulty: ${difficulty}`,
                inline: false,
              },
              {
                name: '🎯 Coming Soon',
                value: 'Learning resources feature is being developed. Check back soon!',
                inline: false,
              },
            ],
            footer: {
              text: `Requested by @${username}`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  } catch (error) {
    logger.error('Commands/MCP', 'MCP Learn failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Error processing learning request',
        flags: 64, // Ephemeral
      },
    });
  }
}
