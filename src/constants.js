/**
 * Application Constants & Configuration
 * Centralized place for all strings, prompts, and configurations
 * Tech Lead: Best practice - never hardcode strings or sensitive values
 */

export const CONSTANTS = {
  // Discord Configuration
  DISCORD: {
    PORT: process.env.PORT || 3000,
    INTERACTION_RESPONSE_TIMEOUT: 3000, // milliseconds
  },

  // Groq Configuration - Multiple API Keys for Rotation
  GROQ: {
    API_KEYS: [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
    ].filter(key => key), // Filter out empty keys
    API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'llama-3.3-70b-versatile',
    DEFAULT_TEMPERATURE: 0.7,
    MAX_TOKENS: 1000,
    TIMEOUT: 10000, // milliseconds
    QUOTA_RESET_HOURS: 24, // How long to wait before retrying a quota-limited key
  },

  // MongoDB Configuration
  MONGODB: {
    URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-bot',
    DB_NAME: 'mcp-bot',
    COLLECTIONS: {
      // Original collections
      DAILY_TASKS: 'daily_tasks',
      USER_ACTIVITY: 'user_activity',
      ACHIEVEMENTS: 'achievements',
      TEAM_STATS: 'team_stats',
      
      // MCP Development Assistant collections
      TEAM_MEMBERS: 'team_members',
      MCP_DEVELOPMENT_LOGS: 'mcp_development_logs',
      MCP_LEARNING_RESOURCES: 'mcp_learning_resources',
      MCP_TEAM_ANALYTICS: 'mcp_team_analytics',
      
      // AI Chat Sessions
      AI_CHAT_SESSIONS: 'ai_chat_sessions',
    },
    CONNECTION_TIMEOUT: 10000,
    MAX_POOL_SIZE: 10,
    MIN_POOL_SIZE: 2,
  },

  // System Prompts for Groq (Optimized for token efficiency)
  PROMPTS: {
    DAILY_SUMMARIZER: `You are a team motivator and productivity coach. Analyze the provided daily tasks and generate a brief, energetic summary (2-3 sentences max).
Format: [Status] + [Insight] + [Motivational tip].
Be concise to save tokens.`,

    DAILY_TASK_SUMMARIZER: `Analyze these daily tasks and provide a motivating summary with key insights and next steps. Keep it to 2-3 sentences.`,

    ACHIEVEMENT_TIP_GENERATOR: `Generate a concise, actionable productivity tip based on today's achievements. 
Output: Single sentence, practical advice. Max 20 words. Keep it motivating.`,

    MCP_NEWS_GENERATOR: `As a tech news curator, provide one cutting-edge tech update about MCP, AI, or frameworks. 
Format: [Technology] + [What's new] + [Why it matters for your team].
Keep under 50 words.`,

    TASK_ANALYZER: `Analyze these completed tasks and categorize them by:
1. Impact level (High/Medium/Low)
2. Complexity (Simple/Complex)
3. Team value (Individual/Team/Company)
Generate brief assessment (1-2 sentences). Be constructive.`,

    VOICE_ASSISTANT: `You are a supportive voice assistant for a development team. 
- Be brief and conversational
- Ask clarifying questions if needed
- Provide actionable advice
- Use encouraging tone
Keep responses under 100 words for voice clarity.`,

    TEAM_ANALYTICS: `You are a team performance analyst. Analyze the provided team statistics and generate insights:
1. Overall team performance assessment
2. Top contributor recognition
3. Recommended focus areas
4. Encouraging message for the team
Keep it concise (3-4 sentences) and constructive.`,

    // MCP Development Assistant Prompts
    MCP_DEV_INSIGHTS: `You are an MCP (Model Context Protocol) development expert. Analyze this development update and provide:
1. Technical insights on the work done
2. MCP tool relevance assessment  
3. Suggestions for improvement
4. Recommended next steps
Keep response under 100 words and constructive.`,

    MCP_CHALLENGE_SOLVER: `You are an expert problem solver for MCP development. The team encountered a challenge:
{challenge}
Provide a practical solution considering:
1. Root cause analysis
2. Step-by-step solution
3. Best practices to avoid this in the future
Keep it concise (3-4 sentences) with actionable advice.`,

    MCP_LEARNING_TIP: `Generate a practical MCP learning tip that helps developers understand MCP concepts better.
Format: [Concept] - [Simple explanation] - [Example] - [Why it matters]
Keep under 80 words and beginner-friendly.`,
  },

  // Response Templates
  RESPONSES: {
    ERRORS: {
      GROQ_API_ERROR: 'Sorry, I encountered an issue connecting to my AI brain. Please try again in a moment.',
      DATABASE_ERROR: 'I had trouble saving that to my memory. Please try again.',
      INVALID_INPUT: 'I didn\'t quite understand that. Could you provide more details?',
      TIMEOUT: 'That took too long. I\'m running a bit slow right now. Try again?',
    },
    SUCCESS: {
      TASK_LOGGED: '✅ Task logged successfully! Keep up the great work!',
      ACHIEVEMENT_RECORDED: '🏆 Achievement recorded! You\'re crushing it!',
      REPORT_GENERATED: '📊 Report generated! Check your DMs.',
    },
  },

  // Command Definitions
  COMMANDS: {
    DAILY_TRACKING: {
      TASK_COMPLETED: {
        name: 'task-completed',
        description: 'Log a task you completed today',
        options: [
          {
            name: 'task_name',
            type: 3, // STRING type
            description: 'What task did you complete?',
            required: true,
          },
          {
            name: 'details',
            type: 3,
            description: 'Optional: More details about the task',
            required: false,
          },
          {
            name: 'category',
            type: 3,
            description: 'Category: coding, documentation, review, other',
            required: false,
          },
        ],
      },
      YESTERDAY_SUMMARY: {
        name: 'yesterday-summary',
        description: 'Get a summary of yesterday\'s work and AI-generated tips',
      },
      TODAY_PLAN: {
        name: 'today-plan',
        description: 'Plan your tasks for today and get AI suggestions',
        options: [
          {
            name: 'tasks',
            type: 3,
            description: 'List your planned tasks (comma-separated)',
            required: true,
          },
        ],
      },
      GET_MOTIVATION: {
        name: 'get-motivation',
        description: 'Get today\'s motivational tip and tech news from Groq AI',
      },
      TEAM_STATS: {
        name: 'team-stats',
        description: 'View team statistics, leaderboard, and analytics',
      },
      VIEW_STREAK: {
        name: 'view-streak',
        description: 'View your current and longest streaks',
      },
      LEADERBOARD: {
        name: 'leaderboard',
        description: 'View global leaderboard of top performers',
      },
    },
  },

  // API Response Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },

  // Logging Levels
  LOG_LEVELS: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  },

  // Cache Settings (to optimize Groq API calls)
  CACHE: {
    MOTIVATION_TTL: 3600, // 1 hour in seconds
    NEWS_TTL: 86400, // 24 hours
    TIPS_TTL: 7200, // 2 hours
    MAX_CACHE_SIZE: 1000, // Maximum number of cache entries
    MAX_CACHE_ITEM_SIZE: 50000, // Max bytes per cached item
  },

  // Input Validation Constraints
  VALIDATION: {
    TASK_NAME_MAX_LENGTH: 100,
    TASK_DETAILS_MAX_LENGTH: 500,
    TASK_CATEGORY_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 1000,
    CHALLENGES_MAX_LENGTH: 500,
    QUESTION_MAX_LENGTH: 2000,
    CONTEXT_MAX_LENGTH: 1000,
    MESSAGE_MAX_LENGTH: 2000,
    CONVERSATION_HISTORY_LIMIT: 5,
  },

  // Discord Permission Bits
  DISCORD_PERMISSIONS: {
    VIEW_CHANNEL: '1024',
    SEND_MESSAGES: '2048',
    VIEW_AND_SEND: '3072',
  },

  // Rate Limiting
  RATE_LIMIT: {
    ENABLED: true,
    WINDOW_MS: 60000, // 1 minute
    MAX_REQUESTS_PER_WINDOW: 10, // Per user
    CLEANUP_INTERVAL: 300000, // 5 minutes
  },
};

export default CONSTANTS;
