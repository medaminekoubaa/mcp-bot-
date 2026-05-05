/**
 * Chat Message Handler
 * Processes messages in AI chat sessions and generates AI responses
 */

import mongodbService from '../services/mongodbService.js';
import groqService from '../services/groqService.js';
import logger from '../services/logger.js';
import { DiscordRequest } from '../utils.js';

/**
 * MCP-focused system prompt for chat sessions
 */
const MCP_CHAT_SYSTEM_PROMPT = `You are an expert MCP (Model Context Protocol) assistant focused on helping teams implement MCP in their Career and AIRA platforms.

SCOPE: Answer ONLY about:
- Model Context Protocol (MCP) architecture and concepts
- Implementing MCP in the Career platform (job apps, CV analysis, interview scheduling)
- Implementing MCP in the AIRA analytics platform (team metrics, skill development)
- Best practices for MCP tool integration
- Troubleshooting MCP implementation issues

GUIDELINES:
1. Keep responses concise (2-3 paragraphs max)
2. Provide practical, actionable advice
3. Include code examples when relevant
4. If asked about non-MCP topics, politely redirect to MCP/Career/AIRA context
5. If you receive screenshots/files, analyze them in MCP context

TONE: Professional, helpful, technical`;

/**
 * Process chat message and generate AI response
 * @param {Object} message - Discord message object
 * @param {string} applicationId - Discord application ID
 */
export async function handleChatMessage(message, applicationId) {
  try {
    // Skip bot messages
    if (message.author.bot) return;

    const channelId = message.channel_id;
    const userId = message.author.id;
    const userName = message.author.username;
    const content = message.content;

    logger.info('Chat/Message', 'Message received', { channelId, userId, content: content.substring(0, 50) });

    // Get or create chat session
    let session = await mongodbService.getChatSessionByChannelId(channelId);
    if (!session) {
      session = await mongodbService.createChatSession({
        userId,
        userName,
        discordChannelId: channelId,
        channelName: `chat-with-ai-${Date.now()}`,
      });
    }

    // Save user message to session
    await mongodbService.addMessageToSession(session._id.toString(), {
      role: 'user',
      content,
      attachments: message.attachments || [],
    });

    // Show typing indicator
    await DiscordRequest(
      `/channels/${channelId}/typing`,
      { method: 'POST' },
      applicationId
    );

    // Build conversation context (last 10 messages)
    const recentMessages = session.messages.slice(-10) || [];
    const conversationHistory = recentMessages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    // Generate AI response with MCP focus
    let aiResponse;
    try {
      const prompt = `${MCP_CHAT_SYSTEM_PROMPT}

CONVERSATION HISTORY:
${conversationHistory}

NEW MESSAGE FROM USER:
${content}

Respond with helpful MCP-focused advice:`;

      aiResponse = await groqService.executeMCPRequest(prompt, 'recommendation', { maxTokens: 300 });
    } catch (aiError) {
      logger.warn('Chat/Message', 'AI generation failed', { error: aiError.message });
      aiResponse = `I encountered an issue generating a response. This might be due to API limitations. Please try again in a moment.`;
    }

    // Validate response length for Discord (max 2000 chars)
    const finalResponse = aiResponse.substring(0, 1900);

    // Save AI response to session
    await mongodbService.addMessageToSession(session._id.toString(), {
      role: 'assistant',
      content: finalResponse,
      attachments: [],
    });

    // Send response to Discord channel
    await DiscordRequest(
      `/channels/${channelId}/messages`,
      {
        method: 'POST',
        body: {
          content: finalResponse,
          // Optional: Add reference to user message
          message_reference: {
            message_id: message.id,
            fail_if_not_exists: false,
          },
        },
      },
      applicationId
    );

    logger.info('Chat/Message', 'Response sent', { channelId, responseLength: finalResponse.length });
  } catch (error) {
    logger.error('Chat/Message', 'Message processing failed', { error: error.message });
    try {
      // Send error message to Discord
      await DiscordRequest(
        `/channels/${message.channel_id}/messages`,
        {
          method: 'POST',
          body: {
            content: '❌ Error processing message. Please try again.',
          },
        },
        applicationId
      );
    } catch (sendError) {
      logger.error('Chat/Message', 'Failed to send error message', { error: sendError.message });
    }
  }
}
