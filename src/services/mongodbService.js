/**
 * MongoDB Service - Database Connection & Operations
 * Tech Lead Pattern: Centralized database service with connection pooling and error handling
 * Handles all MongoDB operations for the Discord bot
 */

import { MongoClient, ObjectId } from 'mongodb';
import { CONSTANTS } from '../constants.js';

class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
    this.connected = false;
  }

  /**
   * Connect to MongoDB with connection pooling
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      if (this.connected) {
        console.log('[MongoDB] Already connected');
        return;
      }

      console.log('[MongoDB] Connecting to database...');

      this.client = new MongoClient(CONSTANTS.MONGODB.URL, {
        maxPoolSize: CONSTANTS.MONGODB.MAX_POOL_SIZE,
        minPoolSize: CONSTANTS.MONGODB.MIN_POOL_SIZE,
        serverSelectionTimeoutMS: CONSTANTS.MONGODB.CONNECTION_TIMEOUT,
      });

      await this.client.connect();
      this.db = this.client.db(CONSTANTS.MONGODB.DB_NAME);

      // Verify connection
      await this.db.admin().ping();

      this.connected = true;
      console.log('[MongoDB] ✅ Connected successfully');

      // Create indexes on startup
      await this.createIndexes();
    } catch (error) {
      console.error('[MongoDB] Connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Create indexes for optimal query performance
   * @private
   */
  async createIndexes() {
    try {
      const tasksCollection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.DAILY_TASKS);
      const activityCollection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.USER_ACTIVITY);

      // Daily tasks indexes
      await tasksCollection.createIndex({ userId: 1, createdAt: -1 });
      await tasksCollection.createIndex({ date: 1 });

      // User activity indexes
      await activityCollection.createIndex({ userId: 1, timestamp: -1 });
      await activityCollection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

      console.log('[MongoDB] ✅ Indexes created');
    } catch (error) {
      console.error('[MongoDB] Index creation error:', error.message);
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.connected = false;
        console.log('[MongoDB] Disconnected');
      }
    } catch (error) {
      console.error('[MongoDB] Disconnect error:', error.message);
    }
  }

  /**
   * DAILY TASKS OPERATIONS
   */

  /**
   * Add a completed task
   * @param {string} userId - Discord user ID
   * @param {Object} taskData - Task details
   * @returns {Promise<Object>} Created task document
   */
  async addDailyTask(userId, taskData) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.DAILY_TASKS);

      const task = {
        userId,
        taskName: taskData.taskName,
        details: taskData.details || '',
        category: taskData.category || 'other',
        createdAt: new Date(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        status: 'completed',
      };

      const result = await collection.insertOne(task);

      console.log(`[MongoDB] Task added for user ${userId}`);
      return { _id: result.insertedId, ...task };
    } catch (error) {
      console.error('[MongoDB] Error adding task:', error.message);
      throw error;
    }
  }

  /**
   * Get today's tasks for a user
   * @param {string} userId - Discord user ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getTodaysTasks(userId) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.DAILY_TASKS);

      const today = new Date().toISOString().split('T')[0];

      const tasks = await collection
        .find({
          userId,
          date: today,
          status: 'completed',
        })
        .sort({ createdAt: -1 })
        .toArray();

      return tasks;
    } catch (error) {
      console.error('[MongoDB] Error getting today\'s tasks:', error.message);
      throw error;
    }
  }

  /**
   * Get yesterday's tasks for a user
   * @param {string} userId - Discord user ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getYesterdaysTasks(userId) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.DAILY_TASKS);

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const tasks = await collection
        .find({
          userId,
          date: yesterday,
          status: 'completed',
        })
        .sort({ createdAt: -1 })
        .toArray();

      return tasks;
    } catch (error) {
      console.error('[MongoDB] Error getting yesterday\'s tasks:', error.message);
      throw error;
    }
  }

  /**
   * Get tasks for a date range
   * @param {string} userId - Discord user ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasksByDateRange(userId, startDate, endDate) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.DAILY_TASKS);

      const tasks = await collection
        .find({
          userId,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        })
        .sort({ createdAt: -1 })
        .toArray();

      return tasks;
    } catch (error) {
      console.error('[MongoDB] Error getting tasks by date range:', error.message);
      throw error;
    }
  }

  /**
   * USER ACTIVITY OPERATIONS
   */

  /**
   * Log user activity
   * @param {string} userId - Discord user ID
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity document
   */
  async logActivity(userId, action, metadata = {}) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.USER_ACTIVITY);

      const activity = {
        userId,
        action,
        metadata,
        timestamp: new Date(),
      };

      const result = await collection.insertOne(activity);
      return { _id: result.insertedId, ...activity };
    } catch (error) {
      console.error('[MongoDB] Error logging activity:', error.message);
      throw error;
    }
  }

  /**
   * Get user activity stats for today
   * @param {string} userId - Discord user ID
   * @returns {Promise<Object>} Activity statistics
   */
  async getUserActivityStats(userId) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.USER_ACTIVITY);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await collection
        .aggregate([
          {
            $match: {
              userId,
              timestamp: { $gte: today },
            },
          },
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      return stats;
    } catch (error) {
      console.error('[MongoDB] Error getting activity stats:', error.message);
      throw error;
    }
  }

  /**
   * ACHIEVEMENTS OPERATIONS
   */

  /**
   * Record an achievement
   * @param {string} userId - Discord user ID
   * @param {Object} achievementData - Achievement details
   * @returns {Promise<Object>} Created achievement document
   */
  async recordAchievement(userId, achievementData) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.ACHIEVEMENTS);

      const achievement = {
        userId,
        title: achievementData.title,
        description: achievementData.description,
        points: achievementData.points || 10,
        category: achievementData.category || 'general',
        unlockedAt: new Date(),
      };

      const result = await collection.insertOne(achievement);
      return { _id: result.insertedId, ...achievement };
    } catch (error) {
      console.error('[MongoDB] Error recording achievement:', error.message);
      throw error;
    }
  }

  /**
   * Get user achievements
   * @param {string} userId - Discord user ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of achievements
   */
  async getUserAchievements(userId, limit = 10) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.ACHIEVEMENTS);

      const achievements = await collection
        .find({ userId })
        .sort({ unlockedAt: -1 })
        .limit(limit)
        .toArray();

      return achievements;
    } catch (error) {
      console.error('[MongoDB] Error getting achievements:', error.message);
      throw error;
    }
  }

  /**
   * Get total achievement points for a user
   * @param {string} userId - Discord user ID
   * @returns {Promise<number>} Total points
   */
  async getUserTotalPoints(userId) {
    try {
      const collection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.ACHIEVEMENTS);

      const result = await collection
        .aggregate([
          { $match: { userId } },
          { $group: { _id: userId, totalPoints: { $sum: '$points' } } },
        ])
        .toArray();

      return result[0]?.totalPoints || 0;
    } catch (error) {
      console.error('[MongoDB] Error getting total points:', error.message);
      throw error;
    }
  }

  /**
   * TEAM STATS OPERATIONS
   */

  /**
   * Get team statistics
   * @returns {Promise<Object>} Team stats
   */
  async getTeamStats() {
    try {
      const tasksCollection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.DAILY_TASKS);

      const stats = await tasksCollection
        .aggregate([
          {
            $match: {
              date: new Date().toISOString().split('T')[0],
            },
          },
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' },
              categoryCounts: {
                $push: {
                  category: '$category',
                  count: 1,
                },
              },
            },
          },
        ])
        .toArray();

      return stats[0] || { totalTasks: 0, uniqueUsers: [], categoryCounts: [] };
    } catch (error) {
      console.error('[MongoDB] Error getting team stats:', error.message);
      throw error;
    }
  }

  /**
   * Get top team contributors by achievement points
   * @param {number} limit - Max number of top contributors to return
   * @returns {Promise<Array>} Top contributors with their total points
   */
  async getTeamTopContributors(limit = 10) {
    try {
      const achievementsCollection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.ACHIEVEMENTS);

      const topContributors = await achievementsCollection
        .aggregate([
          {
            $group: {
              _id: '$userId',
              userId: { $first: '$userId' },
              totalPoints: { $sum: '$points' },
              achievementCount: { $sum: 1 },
            },
          },
          {
            $sort: { totalPoints: -1 },
          },
          {
            $limit: limit,
          },
        ])
        .toArray();

      return topContributors;
    } catch (error) {
      console.error('[MongoDB] Error getting top contributors:', error.message);
      throw error;
    }
  }

  /**
   * Get top performers for today by task count
   * @param {number} limit - Max number of top performers to return
   * @returns {Promise<Array>} Top performers today with their task counts
   */
  async getTopPerformersToday(limit = 10) {
    try {
      const tasksCollection = this.db.collection(CONSTANTS.MONGODB.COLLECTIONS.DAILY_TASKS);
      const today = new Date().toISOString().split('T')[0];

      const topToday = await tasksCollection
        .aggregate([
          {
            $match: {
              date: today,
            },
          },
          {
            $group: {
              _id: '$userId',
              userId: { $first: '$userId' },
              taskCount: { $sum: 1 },
            },
          },
          {
            $sort: { taskCount: -1 },
          },
          {
            $limit: limit,
          },
        ])
        .toArray();

      return topToday;
    } catch (error) {
      console.error('[MongoDB] Error getting top performers today:', error.message);
      throw error;
    }
  }

  /**
   * STREAK OPERATIONS
   */

  /**
   * Get or create user streak record
   * @param {string} userId - Discord user ID
   * @returns {Promise<Object>} Streak data
   */
  async getUserStreak(userId) {
    try {
      const db = this.db;
      const streaksCollection = db.collection('user_streaks');

      let streak = await streaksCollection.findOne({ userId });

      if (!streak) {
        streak = {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastTaskDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await streaksCollection.insertOne(streak);
      }

      return streak;
    } catch (error) {
      console.error('[MongoDB] Error getting streak:', error.message);
      throw error;
    }
  }

  /**
   * Update user streak based on task completion
   * @param {string} userId - Discord user ID
   * @returns {Promise<Object>} Updated streak and any milestone achievements
   */
  async updateUserStreak(userId) {
    try {
      const db = this.db;
      const streaksCollection = db.collection('user_streaks');
      const today = new Date().toISOString().split('T')[0];

      let streak = await streaksCollection.findOne({ userId });

      if (!streak) {
        streak = {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastTaskDate: today,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await streaksCollection.insertOne(streak);
      } else {
        const lastDate = streak.lastTaskDate;
        const lastDateObj = lastDate ? new Date(lastDate) : null;
        const todayObj = new Date();

        let newStreak = streak.currentStreak || 0;

        // Check if task was already logged today
        if (lastDate === today) {
          // Already counted today, no change
          newStreak = streak.currentStreak;
        } else if (lastDateObj) {
          const dayDiff = (todayObj - lastDateObj) / (1000 * 60 * 60 * 24);
          if (dayDiff === 1) {
            // Consecutive day, increment streak
            newStreak = (streak.currentStreak || 0) + 1;
          } else if (dayDiff > 1) {
            // Gap in streak, reset to 1
            newStreak = 1;
          } else {
            newStreak = streak.currentStreak;
          }
        } else {
          newStreak = 1;
        }

        const longestStreak = Math.max(streak.longestStreak || 0, newStreak);

        await streaksCollection.updateOne(
          { userId },
          {
            $set: {
              currentStreak: newStreak,
              longestStreak,
              lastTaskDate: today,
              updatedAt: new Date(),
            },
          }
        );

        streak = await streaksCollection.findOne({ userId });
      }

      return streak;
    } catch (error) {
      console.error('[MongoDB] Error updating streak:', error.message);
      throw error;
    }
  }

  /**
   * Get milestone achievements for a streak
   * @param {number} streakDays - Current streak length
   * @returns {Array} List of milestones reached
   */
  getMilestoneAchievements(streakDays) {
    const milestones = [
      { days: 3, title: '🔥 On Fire!', description: '3-day streak', points: 25 },
      { days: 7, title: '🌟 Weekly Champion', description: 'Completed tasks for 7 consecutive days', points: 50 },
      { days: 14, title: '💪 Unstoppable', description: '14-day streak - legendary commitment', points: 100 },
      { days: 30, title: '👑 Titan', description: '30-day streak - you\'re incredible', points: 250 },
      { days: 60, title: '🚀 Immortal', description: '60-day streak - beyond legends', points: 500 },
      { days: 100, title: '✨ Eternal', description: '100-day streak - one of a kind', points: 1000 },
    ];

    return milestones.filter(m => streakDays % m.days === 0 && streakDays >= m.days);
  }

  /**
   * Check connection status
   * @returns {boolean}
   */
  isConnected() {
    return this.connected;
  }
}

export default new MongoDBService();
