/**
 * Ask Command Handler
 * Implements /ask command for chatting in private AI sessions
 */

import { InteractionResponseType } from 'discord-interactions';
import mongodbService from '../services/mongodbService.js';
import groqService from '../services/groqService.js';
import logger from '../services/logger.js';

/**
 * MCP-focused system prompt for chat sessions
 */
const MCP_CHAT_SYSTEM_PROMPT = `You are an expert MCP (Model Context Protocol) assistant focused on helping teams implement MCP.

SCOPE: Answer ONLY about:
- Model Context Protocol (MCP) architecture and concepts
- Implementing MCP in the Career platform (job applications, CV analysis, interview scheduling)
- Implementing MCP in the AIRA analytics platform (team metrics, skill tracking, performance analysis)
- Best practices for MCP tool integration and debugging
- Troubleshooting MCP implementation issues

RESPONSE GUIDELINES:
1. Keep responses concise (2-3 paragraphs max)
2. Provide practical, actionable advice
3. Include code examples when relevant
4. If asked about non-MCP topics, politely redirect
5. Reference specific Career/AIRA use cases when applicable

TONE: Professional, helpful, technical`;

/**
 * Handle /ask command in chat sessions
 */
export async function handleAsk(req, res) {
  try {
    const userId = req.body.member.user.id;
    const userName = req.body.member.user.username;
    const channelId = req.body.channel_id;
    const { options } = req.body.data;

    const question = options?.find(o => o.name === 'question')?.value || '';
    const context = options?.find(o => o.name === 'context')?.value || '';

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

    // Build conversation context (last 5 messages from session if available)
    let conversationHistory = '';
    if (session && session.messages) {
      const recentMessages = session.messages.slice(-5) || [];
      conversationHistory = recentMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
    }

    // Generate AI response
    let aiResponse;
    try {
      const fullPrompt = `${MCP_CHAT_SYSTEM_PROMPT}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n\n` : ''}NEW QUESTION FROM ${userName}:
${question}${context ? `\n\nAdditional Context: ${context}` : ''}

Provide helpful MCP-focused response:`;

      aiResponse = await groqService.executeMCPRequest(fullPrompt, 'recommendation', { maxTokens: 400 });
    } catch (aiError) {
      logger.warn('Commands/Ask', 'AI generation failed', { error: aiError.message });
      aiResponse = `I encountered an issue generating a response. This might be due to API rate limits. Please try again in a moment.`;
    }

    // Validate response length for Discord (max 2000 chars)
    const finalResponse = aiResponse.substring(0, 1900);

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
