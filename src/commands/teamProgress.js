/**
 * Team Progress Command Handler
 * Implements /team-progress command for viewing team analytics
 */

import { InteractionResponseType } from 'discord-interactions';
import mongodbService from '../services/mongodbService.js';
import logger from '../services/logger.js';

/**
 * Handle /team-progress command
 */
export async function handleTeamProgress(req, res) {
  try {
    const username = req.body.member.user.username;
    const { options } = req.body.data;

    const project = options?.find(o => o.name === 'project')?.value || 'all';
    const period = options?.find(o => o.name === 'period')?.value || 'week';

    logger.info('Commands/MCP', 'Team progress requested', { username, project, period });

    // Get team analytics from MongoDB
    const filters = {};
    if (project !== 'all') filters.project = project;

    const analytics = await mongodbService.getTeamMCPAnalytics(filters);

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: '📊 Team Progress Analytics',
            description: `Team statistics for ${period}`,
            color: 0x3498db,
            fields: [
              {
                name: '📈 Project',
                value: project === 'all' ? 'Career & AIRA' : project,
                inline: true,
              },
              {
                name: '⏰ Period',
                value: period,
                inline: true,
              },
              {
                name: '✅ Tasks Completed',
                value: `${analytics?.summary?.completed || 0}`,
                inline: true,
              },
              {
                name: '📝 Total Tasks',
                value: `${analytics?.summary?.total || 0}`,
                inline: true,
              },
              {
                name: '⚠️ Blocked Tasks',
                value: `${analytics?.summary?.blocked || 0}`,
                inline: true,
              },
              {
                name: '🤖 AI Adoption',
                value: `${analytics?.summary?.ai_usage_rate || 0}%`,
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
    logger.error('Commands/MCP', 'Team progress failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Error fetching team analytics',
        flags: 64, // Ephemeral
      },
    });
  }
}
