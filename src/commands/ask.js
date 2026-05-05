/**
 * Ask Command Handler
 * Implements /ask command for chatting in private AI sessions
 */

import { InteractionResponseType } from 'discord-interactions';
import { CONSTANTS } from '../constants.js';
import mongodbService from '../services/mongodbService.js';
import groqService from '../services/groqService.js';
import logger from '../services/logger.js';
import Validator from '../services/validator.js';

const MCP_CHAT_SYSTEM_PROMPT = `You are an expert MCP (Model Context Protocol) assistant.
SCOPE: Answer ONLY about MCP architecture, Career/AIRA platform implementation, and best practices.
GUIDELINES: Keep responses concise (2-3 paragraphs), provide practical advice, include code examples, reference Career/AIRA use cases.
TONE: Professional, helpful, technical`;

export async function handleAsk(req, res) {
  try {
    const userId = Validator.validateUserId(req.body.member.user.id);
    const userName = req.body.member.user.username;
    const channelId = Validator.validateChannelId(req.body.channel_id);
    const { options } = req.body.data;

    const question = Validator.validateQuestion(options?.find(o => o.name === 'question')?.value);
    const context = Validator.validateContext(options?.find(o => o.name === 'context')?.value);

    logger.info('Commands/Ask', 'Ask command received', { userId, question: question.substring(0, 50) });

    // Check if this is in a chat session channel
    let session = await mongodbService.getChatSessionByChannelId(channelId);
    
    if (!session) {
      // Not in a chat session - can still use /ask but won't save to session
      logger.warn('Commands/Ask', 'Ask command used outside chat session', { channelId });
    } else {
      // Save user message to session
      await mongodbService.addMessageToSession(session._id.toString(), {
        role: 'user',
        content: question,
        attachments: [],
      });
    }

    let conversationHistory = '';
    if (session && session.messages) {
      const recentMessages = session.messages.slice(-CONSTANTS.VALIDATION.CONVERSATION_HISTORY_LIMIT) || [];
      conversationHistory = recentMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
    }

    let aiResponse;
    try {
      const fullPrompt = `${MCP_CHAT_SYSTEM_PROMPT}
${conversationHistory ? `HISTORY:\n${conversationHistory}\n\n` : ''}QUESTION FROM ${userName}:\n${question}${context ? `\n\nContext: ${context}` : ''}`;

      aiResponse = await groqService.executeMCPRequest(fullPrompt, 'recommendation', { maxTokens: 400 });
    } catch (aiError) {
      logger.warn('Ask', 'AI generation failed', { message: aiError.message });
      aiResponse = 'I encountered an issue. Please try again in a moment.';
    }

    const finalResponse = aiResponse.substring(0, CONSTANTS.VALIDATION.MESSAGE_MAX_LENGTH - 100);

    // Save AI response to session if in session
    if (session) {
      await mongodbService.addMessageToSession(session._id.toString(), {
        role: 'assistant',
        content: finalResponse,
        attachments: [],
      });
    }

    logger.info('Commands/Ask', 'Response generated', { responseLength: finalResponse.length });

    // Send response as embed
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: '🤖 MCP Assistant Response',
            description: finalResponse,
            color: 0x5865F2,
            fields: [
              {
                name: '❓ Your Question',
                value: question.substring(0, 200),
                inline: false,
              },
            ],
            footer: {
              text: `Answered for @${userName}`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  } catch (error) {
    logger.error('Commands/Ask', 'Ask command failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Error processing your question. Please try again.',
        flags: 64, // Ephemeral
      },
    });
  }
}
