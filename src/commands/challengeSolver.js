/**
 * Challenge Solver Command Handler
 * Implements /challenge-solver command for technical support
 */

import { InteractionResponseType } from 'discord-interactions';
import groqService from '../services/groqService.js';
import logger from '../services/logger.js';

/**
 * Handle /challenge-solver command
 */
export async function handleChallengeSolver(req, res) {
  try {
    const username = req.body.member.user.username;
    const { options } = req.body.data;

    const problem = options?.find(o => o.name === 'problem')?.value || '';
    const context = options?.find(o => o.name === 'context')?.value || '';

    logger.info('Commands/MCP', 'Challenge solver requested', { username, problem });

    // Get AI solution
    let solution = '';
    try {
      const prompt = `${problem}${context ? ` Context: ${context}` : ''}. Provide a concise solution.`;
      solution = await groqService.executeMCPRequest(prompt, 'challenge-solver', { maxTokens: 250 });
    } catch (aiError) {
      logger.warn('Commands/MCP', 'Failed to generate solution', { error: aiError.message });
      solution = 'Unable to generate solution at this time. Please try again later.';
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: '🔧 Challenge Solution',
            description: solution,
            color: 0x2ecc71,
            fields: [
              {
                name: '⚠️ Problem',
                value: problem,
                inline: false,
              },
              {
                name: '💡 Solution',
                value: solution,
                inline: false,
              },
            ],
            footer: {
              text: `Solved for @${username}`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  } catch (error) {
    logger.error('Commands/MCP', 'Challenge solver failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Error solving challenge',
        flags: 64, // Ephemeral
      },
    });
  }
}
