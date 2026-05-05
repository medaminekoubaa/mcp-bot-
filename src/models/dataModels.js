/**
 * Database Models & Validation Schemas
 * Tech Lead Pattern: Define data structure contracts upfront
 * Ensures data consistency and provides self-documenting code
 */

export const Models = {
  /**
   * Daily Task Schema
   * Represents a completed task by a team member
   */
  DailyTask: {
    userId: {
      type: String,
      required: true,
      description: 'Discord user ID',
    },
    taskName: {
      type: String,
      required: true,
      maxLength: 100,
      description: 'Name of the completed task',
    },
    details: {
      type: String,
      required: false,
      maxLength: 500,
      description: 'Additional details about the task',
    },
    category: {
      type: String,
      enum: ['coding', 'documentation', 'review', 'testing', 'deployment', 'other'],
      default: 'other',
      description: 'Task category',
    },
    date: {
      type: String,
      required: true,
      pattern: 'YYYY-MM-DD',
      description: 'Date the task was completed',
    },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'pending'],
      default: 'completed',
    },
    createdAt: {
      type: Date,
      required: true,
      description: 'When the task was logged',
    },
    updatedAt: {
      type: Date,
      description: 'Last update timestamp',
    },
  },

  /**
   * User Activity Schema
   * Logs all user interactions with the bot
   */
  UserActivity: {
    userId: {
      type: String,
      required: true,
      description: 'Discord user ID',
    },
    action: {
      type: String,
      enum: [
        'task_logged',
        'achievement_unlocked',
        'report_viewed',
        'motivation_requested',
        'voice_joined',
        'command_executed',
      ],
      required: true,
    },
    metadata: {
      type: Object,
      description: 'Additional context for the action',
    },
    timestamp: {
      type: Date,
      required: true,
      description: 'When the action occurred',
    },
  },

  /**
   * Achievement Schema
   * Represents a milestone or achievement unlocked by a user
   */
  Achievement: {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxLength: 100,
      description: 'Achievement name',
    },
    description: {
      type: String,
      required: true,
      maxLength: 300,
      description: 'Achievement description',
    },
    icon: {
      type: String,
      description: 'Emoji or icon for the achievement',
    },
    points: {
      type: Number,
      default: 10,
      min: 0,
      max: 1000,
      description: 'Points awarded for this achievement',
    },
    category: {
      type: String,
      enum: ['productivity', 'collaboration', 'learning', 'general'],
      default: 'general',
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'legendary'],
      default: 'common',
    },
    unlockedAt: {
      type: Date,
      required: true,
    },
  },

  /**
   * Team Stats Schema
   * Aggregated statistics for the team
   */
  TeamStats: {
    date: {
      type: String,
      pattern: 'YYYY-MM-DD',
      required: true,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
    activeMembers: {
      type: Number,
      default: 0,
    },
    categoryBreakdown: {
      type: Object,
      description: 'Tasks per category',
    },
    topContributor: {
      type: String,
      description: 'User ID of top contributor',
    },
    averageTasksPerUser: {
      type: Number,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },

  /**
   * User Profile Schema (Optional - for future expansion)
   */
  UserProfile: {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    totalAchievementPoints: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      required: true,
    },
    preferences: {
      dailyNotificationTime: {
        type: String,
        default: '09:00', // HH:MM format
      },
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark',
      },
    },
    statistics: {
      tasksLogged: { type: Number, default: 0 },
      achievementsUnlocked: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      lastActivityAt: { type: Date },
    },
  },
};

/**
 * Validation utility functions
 */
export const ValidationUtils = {
  /**
   * Validate task data before saving
   */
  validateTask(taskData) {
    const errors = [];

    if (!taskData.taskName || taskData.taskName.trim().length === 0) {
      errors.push('Task name is required');
    }

    if (taskData.taskName && taskData.taskName.length > 100) {
      errors.push('Task name must be less than 100 characters');
    }

    if (taskData.details && taskData.details.length > 500) {
      errors.push('Task details must be less than 500 characters');
    }

    const validCategories = ['coding', 'documentation', 'review', 'testing', 'deployment', 'other'];
    if (taskData.category && !validCategories.includes(taskData.category)) {
      errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate achievement data
   */
  validateAchievement(achievementData) {
    const errors = [];

    if (!achievementData.title || achievementData.title.trim().length === 0) {
      errors.push('Achievement title is required');
    }

    if (!achievementData.description || achievementData.description.trim().length === 0) {
      errors.push('Achievement description is required');
    }

    if (achievementData.points && (achievementData.points < 0 || achievementData.points > 1000)) {
      errors.push('Points must be between 0 and 1000');
    }

    const validRarities = ['common', 'uncommon', 'rare', 'legendary'];
    if (achievementData.rarity && !validRarities.includes(achievementData.rarity)) {
      errors.push(`Invalid rarity. Must be one of: ${validRarities.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default Models;
