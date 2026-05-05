/**
 * Chat Command Handler
 * Implements /chat command to create private AI chat sessions
 */

import { InteractionResponseType } from 'discord-interactions';
import mongodbService from '../services/mongodbService.js';
import logger from '../services/logger.js';
import { DiscordRequest } from '../utils.js';

/**
 * Handle /chat command - creates a private channel for AI conversation
 */
export async function handleChat(req, res) {
  try {
    const userId = req.body.member.user.id;
    const userName = req.body.member.user.username;
    const guildId = req.body.guild_id;
    const applicationId = req.body.application_id;

    logger.info('Commands/Chat', 'Chat session requested', { userId, userName });

    // Acknowledge interaction (defer reply)
    res.send({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    // Generate unique channel name
    const timestamp = Date.now();
    const channelName = `chat-with-ai-${timestamp}`;

    // Create private channel in Discord
    const channelData = {
      name: channelName,
      type: 0, // GUILD_TEXT channel
      parent_id: null, // Top-level channel
      topic: `Private AI chat with ${userName} - MCP & Implementation discussion`,
      permission_overwrites: [
        {
          id: guildId,
          type: 'role',
          deny: '1024', // DENY VIEW_CHANNEL
        },
        {
          id: userId,
          type: 'member',
          allow: '3072', // ALLOW VIEW_CHANNEL + SEND_MESSAGES
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
      throw new Error(`Failed to create channel: ${channelResponse.statusText}`);
    }

    const channel = await channelResponse.json();
    const channelId = channel.id;

    // Create chat session in MongoDB
    await mongodbService.createChatSession({
      userId,
      userName,
      discordChannelId: channelId,
      channelName,
    });

    // Send welcome message to the new channel
    const welcomeEmbed = {
      title: '💬 Welcome to Your Private AI Chat',
      description: 'You can now discuss MCP and implementation strategies with the AI.',
      color: 0x5865F2,
      fields: [
        {
          name: '📝 What you can do:',
          value:
            '• Ask questions about MCP\n• Share screenshots/files for analysis\n• Discuss Career & AIRA implementation\n• Get code review help',
          inline: false,
        },
        {
          name: '✅ AI Focus:',
          value:
            'The AI will answer only about:\n• Model Context Protocol (MCP) concepts\n• Implementation in Career platform\n• AIRA team analytics platform',
          inline: false,
        },
        {
          name: '📤 Supported:',
          value: 'Text messages, images, files, code snippets',
          inline: false,
        },
      ],
      footer: {
        text: 'Type your questions below. Channel will be archived after session ends.',
      },
    };

    await DiscordRequest(
      `/channels/${channelId}/messages`,
      {
        method: 'POST',
        body: {
          embeds: [welcomeEmbed],
        },
      },
      applicationId
    );

    logger.info('Commands/Chat', 'Chat session created', { channelId, userId });
  } catch (error) {
    logger.error('Commands/Chat', 'Chat creation failed', { error: error.message });
  }
}
