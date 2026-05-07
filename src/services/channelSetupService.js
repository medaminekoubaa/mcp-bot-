/**
 * Channel Setup Service
 * Generates and manages channel information messages
 */

import channelGuard from './channelGuard.js';
import logger from './logger.js';
import { DiscordRequest } from '../utils.js';

class ChannelSetupService {
  /**
   * Generate detailed channel info for all managed channels
   * @returns {object} Mapping of channel name to info
   */
  generateAllChannelInfo() {
    const policies = channelGuard.getAllPolicies();
    const info = {};

    for (const [channelKey, policy] of Object.entries(policies)) {
      info[channelKey] = {
        name: channelKey,
        displayName: policy.displayName,
        description: policy.description,
        color: policy.color,
        commands: policy.allowedCommands.map(cmd => ({
          name: cmd,
          display: channelGuard.formatCommandName(cmd),
        })),
      };
    }

    return info;
  }

  /**
   * Get formatted channel info message
   * @param {string} channelName - Channel name
   * @returns {object} Message content with embed
   */
  getChannelInfoMessage(channelName) {
    const info = channelGuard.getChannelInfo(channelName);
    if (!info) {
      return {
        content: '❌ Channel not found in configuration',
      };
    }

    const embed = channelGuard.generateChannelInfoEmbed(channelName);

    return {
      content: null,
      embeds: [embed],
    };
  }

  /**
   * Get comprehensive server setup guide
   * @returns {object[]} Array of embeds
   */
  getServerSetupGuide() {
    return [
      {
        title: '🤖 MCP Bot - Channel Organization',
        description: 'Welcome! The MCP Bot helps your team track work, learn MCP, and collaborate effectively.',
        color: 0x5865f2,
        fields: [
          {
            name: '📌 What This Is',
            value:
              'Each channel below has specific commands to keep conversations organized and focused. Commands only work in their designated channels.',
            inline: false,
          },
          {
            name: '🚀 Getting Started',
            value: '1. Check the pinned messages in each channel\n2. Use the commands listed for that channel\n3. See detailed info with `/help` in any channel',
            inline: false,
          },
        ],
        footer: {
          text: '💡 Tip: Type / in any channel to see available commands',
        },
      },
      {
        title: '📅 Daily Tasks Channel',
        description: 'Track your daily work and plan your day',
        color: 0x3498db,
        fields: [
          {
            name: 'Purpose',
            value: 'Log completed tasks, review yesterday, and plan today',
            inline: false,
          },
          {
            name: '📋 Commands',
            value:
              '• `📊 /yesterday-summary` - AI summary of yesterday\'s work\n• `📋 /today-plan` - Plan today with AI suggestions\n• `✅ /task-completed` - Log a completed task',
            inline: false,
          },
          {
            name: '💡 Usage',
            value:
              'Every team member should use these daily to track work and get organized for the day ahead.',
            inline: false,
          },
        ],
      },
      {
        title: '👥 Team Channel',
        description: 'View team performance and celebrate wins',
        color: 0x9b59b6,
        fields: [
          {
            name: 'Purpose',
            value: 'Track team velocity, streaks, and recognize top performers',
            inline: false,
          },
          {
            name: '📋 Commands',
            value:
              '• `📈 /team-stats` - View team statistics and insights\n• `🔥 /view-streak` - Check your streak counter\n• `🏆 /leaderboard` - See top performers and rankings',
            inline: false,
          },
          {
            name: '💡 Usage',
            value:
              'Check in regularly to see team progress and get motivated by peer performance.',
            inline: false,
          },
        ],
      },
      {
        title: '🔨 Dev Tracking Channel',
        description: 'Log MCP development and analyze team progress',
        color: 0x27ae60,
        fields: [
          {
            name: 'Purpose',
            value: 'Track development progress on MCP projects and view team analytics',
            inline: false,
          },
          {
            name: '📋 Commands',
            value:
              '• `🚀 /dev-update` - Log your development work and progress\n• `📊 /team-progress` - View team statistics and metrics',
            inline: false,
          },
          {
            name: '💡 Usage',
            value:
              'Log your dev work daily. This builds a record of progress and helps the team understand project velocity.',
            inline: false,
          },
        ],
      },
      {
        title: '💬 Chat with IA Channel',
        description: 'Start private conversations about MCP',
        color: 0xf39c12,
        fields: [
          {
            name: 'Purpose',
            value: 'Create private channels for AI-powered MCP discussions',
            inline: false,
          },
          {
            name: '📋 Commands',
            value:
              '• `💬 /chat` - Create a private AI chat session (only visible to you)\n• `❓ /ask` - Ask questions about MCP and AI (in private chat or regular channels)',
            inline: false,
          },
          {
            name: '💡 Usage',
            value:
              'Use `/chat` to create a private channel, then `/ask` to have focused conversations. All chats are saved for future reference.',
            inline: false,
          },
        ],
      },
      {
        title: '📚 MCP Learning Channel',
        description: 'Learn MCP, Docker, AI, and get daily tips',
        color: 0x1abc9c,
        fields: [
          {
            name: 'Purpose',
            value: 'Continuous learning about MCP, Docker, AI/LLM, and best practices',
            inline: false,
          },
          {
            name: '📋 Commands',
            value:
              '• `📚 /mcp-learn` - Learning resources (MCP/Docker/AI/Tools)\n• `💡 /daily-tip` - Educational tips rotating through topics\n• `🔧 /challenge-solver` - Get help solving technical problems\n• `🧠 /ai-insights` - AI-powered team insights and recommendations',
            inline: false,
          },
          {
            name: '💡 Usage',
            value:
              'Check daily tips for quick learning bites. Use challenge-solver for blockers and ai-insights for strategic recommendations.',
            inline: false,
          },
        ],
      },
      {
        title: '📍 General Channel',
        description: 'Daily motivation and announcements',
        color: 0xe74c3c,
        fields: [
          {
            name: 'Purpose',
            value: 'Get daily motivation and important team announcements',
            inline: false,
          },
          {
            name: '📋 Commands',
            value: '• `💪 /get-motivation` - Get daily motivation tips and tech news',
            inline: false,
          },
          {
            name: '💡 Usage',
            value:
              'Use this when you need a boost! The AI generates personalized motivation based on your work patterns.',
            inline: false,
          },
        ],
      },
      {
        title: '📖 Documentation Channel',
        description: 'Guides, references, and resources',
        color: 0x34495e,
        fields: [
          {
            name: 'Purpose',
            value:
              'Store comprehensive guides, setup instructions, and reference materials',
            inline: false,
          },
          {
            name: 'Content',
            value:
              'Full bot documentation, FAQ, troubleshooting, and best practices',
            inline: false,
          },
          {
            name: '💡 Usage',
            value:
              'Pin important docs here. This is your knowledge base for the team.',
            inline: false,
          },
        ],
      },
      {
        title: '✨ Final Tips',
        description: 'Make the most of MCP Bot',
        color: 0x2ecc71,
        fields: [
          {
            name: '✅ Do This',
            value:
              '✅ Log tasks daily in #daily-tasks\n✅ Check team stats in #team\n✅ Learn daily with #mcp-learning\n✅ Create private chats with /chat',
            inline: false,
          },
          {
            name: '❌ Avoid',
            value:
              '❌ Using wrong channel for commands\n❌ Skipping task logging\n❌ Ignoring blockers\n❌ Not sharing learnings',
            inline: false,
          },
          {
            name: '🎯 Questions?',
            value:
              'Check pinned messages in each channel or ask in #documentation',
            inline: false,
          },
        ],
      },
    ];
  }

  /**
   * Create command list for a specific channel
   * @param {string} channelName - Channel name
   * @returns {object} Embed with command list
   */
  createChannelCommandEmbed(channelName) {
    return channelGuard.generateChannelInfoEmbed(channelName);
  }

  /**
   * Get onboarding guide for new team members
   * @returns {object[]} Array of embeds for onboarding
   */
  getOnboardingGuide() {
    return [
      {
        title: '🎉 Welcome to the Team!',
        description: 'Here\'s how to get started with MCP Bot',
        color: 0x2ecc71,
        fields: [
          {
            name: '📍 Step 1: Explore Channels',
            value:
              'Look at the channel list to the left. Each has a specific purpose for our team.',
            inline: false,
          },
          {
            name: '📋 Step 2: Read Pinned Messages',
            value:
              'Each channel has pinned messages (⭐) with instructions on what commands work there.',
            inline: false,
          },
          {
            name: '💬 Step 3: Start Using Commands',
            value:
              'Type `/` in any channel to see available commands. Try them in the appropriate channel.',
            inline: false,
          },
        ],
      },
      {
        title: '🚀 Your First Tasks',
        description: 'Quick actions to get started',
        color: 0x3498db,
        fields: [
          {
            name: '1. Check Daily Tasks',
            value: 'Go to #daily-tasks and use `/today-plan` to see what\'s expected',
            inline: false,
          },
          {
            name: '2. View Team Stats',
            value: 'Go to #team and use `/team-stats` to see how the team is doing',
            inline: false,
          },
          {
            name: '3. Start Learning',
            value: 'Go to #mcp-learning and use `/daily-tip` to get a quick learning tip',
            inline: false,
          },
          {
            name: '4. Create Private Chat',
            value: 'Go to #chat-with-ia and use `/chat` to start asking MCP questions',
            inline: false,
          },
        ],
      },
    ];
  }

  /**
   * Log channel setup event
   * @param {string} action - Action type
   * @param {string} details - Details about the action
   */
  logSetupEvent(action, details) {
    logger.info('ChannelSetup', action, details);
  }
}

export default new ChannelSetupService();
