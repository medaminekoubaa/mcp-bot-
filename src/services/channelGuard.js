/**
 * Channel Guard Service
 * Manages command-to-channel restrictions and channel policies
 */

import logger from './logger.js';

const CHANNEL_POLICIES = {
  // Daily Tasks Channel
  'daily-tasks': {
    displayName: '📅 Daily Tasks',
    description: 'Track daily work and plan your day',
    allowedCommands: ['yesterday-summary', 'today-plan', 'task-completed'],
    color: 0x3498db, // Blue
  },

  // Team Channel
  'team': {
    displayName: '👥 Team',
    description: 'View team performance and statistics',
    allowedCommands: ['team-stats', 'view-streak', 'leaderboard'],
    color: 0x9b59b6, // Purple
  },

  // General Channel
  'general': {
    displayName: '📍 General',
    description: 'Daily motivation and announcements',
    allowedCommands: ['get-motivation'],
    color: 0xe74c3c, // Red
  },

  // Dev Tracking Channel
  'dev-tracking': {
    displayName: '🔨 Dev Tracking',
    description: 'MCP development progress and team analytics',
    allowedCommands: ['dev-update', 'team-progress'],
    color: 0x27ae60, // Green
  },

  // Chat with IA Channel
  'chat-with-ia': {
    displayName: '💬 Chat with IA',
    description: 'Start private AI conversations about MCP',
    allowedCommands: ['chat', 'ask'],
    color: 0xf39c12, // Orange
  },

  // MCP Learning Channel
  'mcp-learning': {
    displayName: '📚 MCP Learning',
    description: 'Learn MCP, Docker, AI, and get daily tips',
    allowedCommands: ['mcp-learn', 'daily-tip', 'challenge-solver', 'ai-insights'],
    color: 0x1abc9c, // Turquoise
  },

  // Documentation Channel
  'documentation': {
    displayName: '📖 Documentation',
    description: 'Guides, references, and resources',
    allowedCommands: [],
    color: 0x34495e, // Dark Gray
  },

  // Announcement Channel
  'announcements': {
    displayName: '🎯 Announcements',
    description: 'Updates, features, and important news',
    allowedCommands: [],
    color: 0xc0392b, // Dark Red
  },
};

class ChannelGuard {
  /**
   * Check if a command is allowed in a specific channel
   * @param {string} commandName - Command name (e.g., 'task-completed')
   * @param {string} channelId - Discord channel ID
   * @param {string} channelName - Discord channel name (fallback)
   * @returns {{allowed: boolean, reason: string, policy: object}}
   */
  checkCommandAllowed(commandName, channelId, channelName) {
    try {
      // Find the policy for this channel by name
      const policy = this.getPolicyByChannelName(channelName);

      if (!policy) {
        // No policy found - allow command (unmanaged channel)
        return {
          allowed: true,
          reason: 'Channel not managed by bot',
          policy: null,
        };
      }

      const isAllowed = policy.allowedCommands.includes(commandName);

      return {
        allowed: isAllowed,
        reason: isAllowed
          ? `✅ ${commandName} is allowed in ${policy.displayName}`
          : `❌ ${commandName} is not allowed here. Use it in ${this.getCommandChannels(commandName).join(' or ')}`,
        policy,
      };
    } catch (error) {
      logger.error('ChannelGuard', 'checkCommandAllowed failed', {
        commandName,
        channelName,
        error: error.message,
      });
      // On error, allow command (fail-open)
      return { allowed: true, reason: 'Error checking policy', policy: null };
    }
  }

  /**
   * Get policy by channel name
   * @param {string} channelName - Channel name
   * @returns {object|null}
   */
  getPolicyByChannelName(channelName) {
    if (!channelName) return null;

    const normalizedName = channelName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\-]/g, '-');

    // Exact match
    if (CHANNEL_POLICIES[normalizedName]) {
      return CHANNEL_POLICIES[normalizedName];
    }

    // Partial match (e.g., "daily-tasks-archive" matches "daily-tasks")
    for (const [key, policy] of Object.entries(CHANNEL_POLICIES)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return policy;
      }
    }

    return null;
  }

  /**
   * Get which channels a command is allowed in
   * @param {string} commandName - Command name
   * @returns {string[]}
   */
  getCommandChannels(commandName) {
    const channels = [];
    for (const [channelKey, policy] of Object.entries(CHANNEL_POLICIES)) {
      if (policy.allowedCommands.includes(commandName)) {
        channels.push(policy.displayName);
      }
    }
    return channels.length > 0 ? channels : ['No specific channel'];
  }

  /**
   * Get all policies
   * @returns {object}
   */
  getAllPolicies() {
    return CHANNEL_POLICIES;
  }

  /**
   * Get policy info for a specific channel
   * @param {string} channelName - Channel name
   * @returns {object|null}
   */
  getChannelInfo(channelName) {
    const policy = this.getPolicyByChannelName(channelName);
    if (!policy) return null;

    return {
      ...policy,
      commands: policy.allowedCommands.map(cmd => ({
        name: cmd,
        display: this.formatCommandName(cmd),
      })),
    };
  }

  /**
   * Format command name for display
   * @param {string} cmd - Command name
   * @returns {string}
   */
  formatCommandName(cmd) {
    const displayNames = {
      'yesterday-summary': "📊 /yesterday-summary - AI summary of yesterday's work",
      'today-plan': '📋 /today-plan - Plan today with AI suggestions',
      'task-completed': '✅ /task-completed - Log a completed task',
      'team-stats': '📈 /team-stats - View team statistics',
      'view-streak': '🔥 /view-streak - Check your streak counter',
      'leaderboard': '🏆 /leaderboard - See top performers',
      'get-motivation': '💪 /get-motivation - Get daily motivation',
      'dev-update': '🚀 /dev-update - Log development progress',
      'team-progress': '📊 /team-progress - View team analytics',
      'chat': '💬 /chat - Create private AI chat session',
      'ask': '❓ /ask - Ask MCP questions',
      'mcp-learn': '📚 /mcp-learn - Learning resources',
      'daily-tip': '💡 /daily-tip - Educational tips',
      'challenge-solver': '🔧 /challenge-solver - Solve technical problems',
      'ai-insights': '🧠 /ai-insights - AI-powered insights',
    };
    return displayNames[cmd] || `/${cmd}`;
  }

  /**
   * Generate embed for channel info
   * @param {string} channelName - Channel name
   * @returns {object|null} Discord embed
   */
  generateChannelInfoEmbed(channelName) {
    const info = this.getChannelInfo(channelName);
    if (!info) return null;

    const commandsList = info.commands
      .map(cmd => cmd.display)
      .join('\n');

    return {
      title: `${info.displayName}`,
      description: info.description,
      color: info.color,
      fields: [
        {
          name: '📋 Allowed Commands',
          value: commandsList || 'No specific commands',
          inline: false,
        },
        {
          name: '💡 Tip',
          value: `Use these commands in this channel to keep discussions organized and easy to follow.`,
          inline: false,
        },
      ],
      footer: {
        text: `${info.allowedCommands.length} command${info.allowedCommands.length !== 1 ? 's' : ''} available`,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create error response when command not allowed
   * @param {string} commandName - Command name
   * @param {string} channelName - Channel name
   * @returns {object}
   */
  createErrorEmbed(commandName, channelName) {
    const allowedChannels = this.getCommandChannels(commandName);
    const policy = this.getPolicyByChannelName(channelName);

    return {
      title: '❌ Command Not Allowed Here',
      description: `The command \`/${commandName}\` cannot be used in ${policy ? policy.displayName : 'this channel'}.`,
      color: 0xe74c3c,
      fields: [
        {
          name: '📍 Use This Command In:',
          value: allowedChannels.join('\n') || 'No specific channel required',
          inline: false,
        },
        {
          name: '💬 Commands In This Channel:',
          value: policy
            ? policy.allowedCommands
                .map(cmd => `\`/${cmd}\``)
                .join(', ')
            : 'No restrictions',
          inline: false,
        },
      ],
      footer: {
        text: 'Commands are organized by channel to keep discussions focused',
      },
    };
  }
}

export default new ChannelGuard();
