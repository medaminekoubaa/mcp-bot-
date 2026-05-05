/**
 * MCP Development Update Command Handler
 * Implements /dev-update command for logging MCP development work
 */

import { InteractionResponseType } from 'discord-interactions';
import { CONSTANTS } from '../constants.js';
import mongodbService from '../services/mongodbService.js';
import groqService from '../services/groqService.js';
import logger from '../services/logger.js';
import Validator from '../services/validator.js';

export async function handleDevUpdate(req, res) {
  try {
    const discordId = Validator.validateUserId(req.body.member.user.id);
    const username = req.body.member.user.username;
    const { options } = req.body.data;

    const project = options?.find(o => o.name === 'project')?.value || 'Career';
    const taskCategory = options?.find(o => o.name === 'task_category')?.value || 'feature';
    const description = Validator.validateDescription(options?.find(o => o.name === 'description')?.value);
    const mcpToolsInput = options?.find(o => o.name === 'mcp_tools')?.value || '';
    const challenges = Validator.validateChallenges(options?.find(o => o.name === 'challenges')?.value);
    const status = Validator.validateStatus(options?.find(o => o.name === 'status')?.value);

    const mcpTools = Validator.validateMcpTools(mcpToolsInput);

    logger.info('Commands/MCP', 'Development update logged', {
      discordId,
      project,
      taskCategory,
      mcpTools,
    });

    // Save development log to database
    const devLogData = {
      project,
      taskCategory,
      taskDescription: description.substring(0, 1000),
      mcpTools,
      challenges: challenges.substring(0, 500),
      status,
      aiUsed: false,
    };

    const savedLog = await mongodbService.logMCPDevelopmentUpdate(discordId, devLogData);

    // Generate AI insights using Groq with system context
    let aiInsights = '';
    try {
      const prompt = `User: ${username} | Project: ${project} | Work: ${description} | Tools: ${mcpTools.join(', ') || 'N/A'} | Challenges: ${challenges || 'None'}`;
      
      aiInsights = await groqService.executeMCPRequest(prompt, 'dev-update', {
        temperature: 0.7,
        maxTokens: 200,
      });
    } catch (aiError) {
      console.warn('[DevUpdate] AI insights failed, continuing without:', aiError.message);
      aiInsights = '(AI insights unavailable)';
    }

    // Build response embed
    const responseEmbed = {
      title: `📊 Development Update Logged - ${project}`,
      color: project === 'Career' ? 0x2ecc71 : 0x3498db, // Green for Career, Blue for AIRA
      thumbnail: {
        url: 'https://github.com/favicon.ico',
      },
      fields: [
        {
          name: '📝 Task Category',
          value: `\`${taskCategory}\``,
          inline: true,
        },
        {
          name: '⏱️ Status',
          value: `\`${status}\``,
          inline: true,
        },
        {
          name: '📌 Description',
          value: description || '*(No description)*',
          inline: false,
        },
        {
          name: '🛠️ MCP Tools Involved',
          value: mcpTools.length > 0 ? `\`${mcpTools.join('`, `')}\`` : '*(None mentioned)*',
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: `Logged by @${username} | ID: ${savedLog._id.toString().slice(0, 8)}`,
      },
    };

    // Add challenges if provided
    if (challenges) {
      responseEmbed.fields.push({
        name: '⚠️ Challenges Encountered',
        value: challenges,
        inline: false,
      });
    }

    // Add AI insights
    responseEmbed.fields.push({
      name: '🤖 AI Insights',
      value: aiInsights || '*(Unable to generate insights)*',
      inline: false,
    });

    // Return response with embed
    res.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [responseEmbed],
        flags: 0, // Visible to all
      },
    });

    if (aiInsights && aiInsights !== '(AI insights unavailable)') {
      await mongodbService.updateMCPDevLog(savedLog._id, {
        ai_used: true,
        ai_tools: ['Groq'],
      });
    }
  } catch (error) {
    logger.error('DevUpdate', 'Command failed', { message: error.message });

    return res.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `❌ ${error.message || 'Error logging development update. Please try again.'}`,
        flags: 64,
      },
    });
  }
}

export default {
  handleDevUpdate,
};
