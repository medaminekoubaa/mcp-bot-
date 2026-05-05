/**
 * AI Insights Command Handler
 * Implements /ai-insights command for team insights
 */

import { InteractionResponseType } from 'discord-interactions';
import mongodbService from '../services/mongodbService.js';
import groqService from '../services/groqService.js';
import logger from '../services/logger.js';

/**
 * Handle /ai-insights command
 */
export async function handleAiInsights(req, res) {
  try {
    const username = req.body.member.user.username;
    const { options } = req.body.data;

    const metric = options?.find(o => o.name === 'metric')?.value || 'velocity';

    logger.info('Commands/MCP', 'AI insights requested', { username, metric });

    // Get analytics data
    const analytics = await mongodbService.getTeamMCPAnalytics({});

    // Generate AI insights
    let insights = '';
    try {
      const dataStr = `Metric: ${metric}, Data: ${JSON.stringify(analytics?.summary || {})}`;
      const prompt = `Provide brief AI insights about team ${metric}. ${dataStr}`;
      insights = await groqService.executeMCPRequest(prompt, 'recommendation', { maxTokens: 200 });
    } catch (aiError) {
      logger.warn('Commands/MCP', 'Failed to generate insights', { error: aiError.message });
      insights = 'Insights will be available soon!';
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: '🤖 AI Team Insights',
            description: insights,
            color: 0x9b59b6,
            fields: [
              {
                name: '📊 Metric',
                value: metric,
                inline: true,
              },
              {
                name: '📈 Trend',
                value: 'Analyzing...',
                inline: true,
              },
              {
                name: '✨ Recommendations',
                value: insights,
                inline: false,
              },
            ],
            footer: {
              text: `Generated for @${username}`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  } catch (error) {
    logger.error('Commands/MCP', 'AI insights failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Error generating insights',
        flags: 64, // Ephemeral
      },
    });
  }
}
