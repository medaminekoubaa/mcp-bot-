/**
 * Chat Command Handler
 * Implements /chat command to create private AI chat sessions
 */

import { InteractionResponseType } from 'discord-interactions';
import { CONSTANTS } from '../constants.js';
import mongodbService from '../services/mongodbService.js';
import logger from '../services/logger.js';
import Validator from '../services/validator.js';
import { DiscordRequest } from '../utils.js';

export async function handleChat(req, res) {
  try {
    const userId = Validator.validateUserId(req.body.member.user.id);
    const userName = req.body.member.user.username;
    const guildId = req.body.guild_id;
    const applicationId = req.body.application_id;

    logger.info('Chat', 'Session requested', { userId });

    res.send({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    const timestamp = Date.now();
    const channelName = `chat-${timestamp}`;

    const channelData = {
      name: channelName,
      type: 0,
      parent_id: null,
      topic: `AI chat with ${userName}`,
      permission_overwrites: [
        {
          id: guildId,
          type: 'role',
          deny: CONSTANTS.DISCORD_PERMISSIONS.VIEW_CHANNEL,
        },
        {
          id: userId,
          type: 'member',
          allow: CONSTANTS.DISCORD_PERMISSIONS.VIEW_AND_SEND,
        },
      ],
    };

    // Create channel via Discord API
    const channelResponse = await DiscordRequest(
      `/guilds/${guildId}/channels`,
      { method: 'POST', body: channelData },
      applicationId
    );

    if (!channelResponse.ok) {
      throw new Error(`Failed to create channel`);
    }

    const channel = await channelResponse.json();
    const channelId = channel.id;

    await mongodbService.createChatSession({
      userId,
      userName,
      discordChannelId: channelId,
      channelName,
    });

    const welcomeEmbed = {
      title: '💬 AI Chat Session',
      description: 'Use `/ask` command to chat with AI about MCP and implementation',
      color: 0x5865F2,
      fields: [
        {
          name: '📝 Usage',
          value: 'Use `/ask question: <your question>`',
          inline: false,
        },
        {
          name: '✅ Topics',
          value: 'MCP concepts, Career platform, AIRA analytics',
          inline: false,
        },
        {
          name: '🔒 Privacy',
          value: 'Private channel - only visible to you',
          inline: false,
        },
      ],
    };

    try {
      await DiscordRequest(
        `/channels/${channelId}/messages`,
        {
          method: 'POST',
          body: { embeds: [welcomeEmbed] },
        },
        applicationId
      );
    } catch (messageError) {
      logger.warn('Chat', 'Failed to send welcome message', { message: messageError.message });
    }

    logger.info('Chat', 'Session created', { channelId, userId });
  } catch (error) {
    logger.error('Chat', 'Creation failed', { message: error.message });
  }
}
