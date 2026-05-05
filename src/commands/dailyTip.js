/**
 * Daily Tip Command Handler
 * Implements /daily-tip command for educational tips
 */

import { InteractionResponseType } from 'discord-interactions';
import groqService from '../services/groqService.js';
import logger from '../services/logger.js';

/**
 * Handle /daily-tip command
 */
export async function handleDailyTip(req, res) {
  try {
    const username = req.body.member.user.username;
    const { options } = req.body.data;

    const category = options?.find(o => o.name === 'category')?.value || 'mcp';

    logger.info('Commands/MCP', 'Daily tip requested', { username, category });

    // Generate AI tip
    let tip = '';
    try {
      const prompt = `Generate a brief, actionable daily tip about ${category}. Max 2 sentences.`;
      tip = await groqService.executeMCPRequest(prompt, 'learning', { maxTokens: 100 });
    } catch (aiError) {
      logger.warn('Commands/MCP', 'Failed to generate AI tip', { error: aiError.message });
      tip = `Tips for ${category} will be available soon!`;
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: '💡 Daily Tip',
            description: tip,
            color: 0xf39c12,
            fields: [
              {
                name: '📚 Category',
                value: category,
                inline: true,
              },
              {
                name: '📅 Date',
                value: new Date().toLocaleDateString(),
                inline: true,
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
    logger.error('Commands/MCP', 'Daily tip failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Error generating tip',
        flags: 64, // Ephemeral
      },
    });
  }
}
