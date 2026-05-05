/**
 * Daily Tracking Commands Handler
 * Implements slash commands for task tracking and AI-powered motivation
 */

import { InteractionResponseType } from 'discord-interactions';
import { CONSTANTS } from './constants.js';
import mongodbService from './services/mongodbService.js';
import groqService from './services/groqService.js';
import logger from './services/logger.js';

/**
 * Handle /task-completed command
 * Logs a completed task and saves to database
 */
export async function handleTaskCompleted(req, res) {
  try {
    const userId = req.body.member.user.id;
    const username = req.body.member.user.username;
    const { options } = req.body.data;

    // Parse command options
    const taskName = options?.find(o => o.name === 'task_name')?.value || 'Unknown Task';
    const details = options?.find(o => o.name === 'details')?.value || '';
    const category = options?.find(o => o.name === 'category')?.value || 'general';

    logger.info('Commands', 'Task completed', { userId, taskName, category });

    // Save to database
    const taskData = {
      userId,
      taskName: taskName.substring(0, 100),
      details: details.substring(0, 500),
      category,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      status: 'completed',
    };

    await mongodbService.addDailyTask(userId, taskData);
    await mongodbService.logActivity(userId, 'task_logged', { taskName, category });

    // Update streak and check for milestones
    const updatedStreak = await mongodbService.updateUserStreak(userId);
    const milestones = mongodbService.getMilestoneAchievements(updatedStreak.currentStreak);

    // Record milestone achievements
    for (const milestone of milestones) {
      await mongodbService.recordAchievement(userId, {
        title: milestone.title,
        description: milestone.description,
        points: milestone.points,
        category: 'milestone',
      });
    }

    // Get user achievements
    const achievements = await mongodbService.getUserAchievements(userId, 5);
    const totalPoints = await mongodbService.getUserTotalPoints(userId);

    const streakEmoji = updatedStreak.currentStreak >= 3 ? '🔥' : '📈';
    const streakText = updatedStreak.currentStreak > 1 
      ? `\n🔥 **Current Streak:** ${updatedStreak.currentStreak} days! (Longest: ${updatedStreak.longestStreak})`
      : '';

    const milestoneText = milestones.length > 0
      ? `\n🎉 **New Milestones Unlocked:**\n${milestones.map(m => `• ${m.title} (+${m.points} pts)`).join('\n')}`
      : '';

    const responseText = achievements.length > 0
      ? `Great work, **${username}**! 🎉\n\n**Task:** ${taskName}\n**Category:** ${category}\n\n📊 **Your Stats:**\n• Total Points: ${totalPoints}\n• Achievements: ${achievements.length}${streakText}${milestoneText}`
      : `Great work, **${username}**! 🎉\n\n**Task:** ${taskName}\n**Category:** ${category}\n\n💪 Keep it up!${streakText}${milestoneText}`;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: responseText,
      },
    });
  } catch (error) {
    logger.error('Commands', 'taskCompleted failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `❌ Error: ${error.message}`,
      },
    });
  }
}

/**
 * Handle /yesterday-summary command
 * Generates AI summary of yesterday's work
 */
export async function handleYesterdaySummary(req, res) {
  try {
    const userId = req.body.member.user.id;
    const username = req.body.member.user.username;

    logger.info('Commands', 'Yesterday summary requested', { userId });

    // Send deferred response (since AI call takes time)
    res.send({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    // Get yesterday's tasks
    const yesterdaysTasks = await mongodbService.getYesterdaysTasks(userId);

    if (!yesterdaysTasks || yesterdaysTasks.length === 0) {
      await sendFollowup(req, `No tasks found for yesterday, **${username}**. 📭`);
      return;
    }

    // Prepare data for AI
    const tasksList = yesterdaysTasks
      .map((t, i) => `${i + 1}. [${t.category}] ${t.taskName}`)
      .join('\n');

    const userMessage = `Here are my tasks from yesterday:\n\n${tasksList}`;

    // Get AI summary
    const summary = await groqService.getResponse(
      userMessage,
      CONSTANTS.PROMPTS.DAILY_TASK_SUMMARIZER,
      0.7,
      500
    );

    const responseText = `**📋 Yesterday's Summary**\n\n${summary}\n\n**Tasks Completed:** ${yesterdaysTasks.length}`;

    await sendFollowup(req, responseText);
  } catch (error) {
    logger.error('Commands', 'yesterdaySummary failed', { error: error.message });
    await sendFollowup(req, `❌ Error generating summary: ${error.message}`);
  }
}

/**
 * Handle /today-plan command
 * Plans today's tasks and provides AI suggestions
 */
export async function handleTodayPlan(req, res) {
  try {
    const userId = req.body.member.user.id;
    const username = req.body.member.user.username;

    logger.info('Commands', 'Today plan requested', { userId });

    res.send({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    // Get today's tasks
    const todaysTasks = await mongodbService.getTodaysTasks(userId);
    const yesterdaysTasks = await mongodbService.getYesterdaysTasks(userId);

    const todaysTasksList = todaysTasks && todaysTasks.length > 0
      ? todaysTasks.map((t, i) => `${i + 1}. [${t.category}] ${t.taskName}`).join('\n')
      : 'No tasks planned yet.';

    const yesterdayCount = yesterdaysTasks ? yesterdaysTasks.length : 0;

    const userMessage = `Today's planned tasks:\n\n${todaysTasksList}\n\nYesterday I completed ${yesterdayCount} tasks.`;

    // Get AI suggestions
    const suggestions = await groqService.getResponse(
      userMessage,
      CONSTANTS.PROMPTS.TASK_ANALYZER,
      0.7,
      600
    );

    const responseText = `**📅 Today's Plan**\n\n${suggestions}\n\n**Planned Tasks:** ${todaysTasks ? todaysTasks.length : 0}`;

    await sendFollowup(req, responseText);
  } catch (error) {
    logger.error('Commands', 'todayPlan failed', { error: error.message });
    await sendFollowup(req, `❌ Error generating plan: ${error.message}`);
  }
}

/**
 * Handle /get-motivation command
 * Provides daily motivation tips and tech news
 */
export async function handleGetMotivation(req, res) {
  try {
    const userId = req.body.member.user.id;
    const username = req.body.member.user.username;

    logger.info('Commands', 'Motivation requested', { userId });

    res.send({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    // Get user stats for personalized motivation
    const totalPoints = await mongodbService.getUserTotalPoints(userId);
    const achievements = await mongodbService.getUserAchievements(userId, 3);

    const userMessage = `I have ${totalPoints} points and ${achievements.length} achievements.`;

    // Get motivation and tech news
    const [motivation, techNews] = await Promise.all([
      groqService.getResponse(
        userMessage,
        CONSTANTS.PROMPTS.ACHIEVEMENT_TIP_GENERATOR,
        0.8,
        300
      ),
      groqService.getResponse(
        'Tell me about latest trends in MCP, AI, or development frameworks.',
        CONSTANTS.PROMPTS.MCP_NEWS_GENERATOR,
        0.7,
        400
      ),
    ]);

    const responseText = `**💪 Daily Motivation & Tech News**\n\n**Your Motivation:**\n${motivation}\n\n**🚀 Tech News:**\n${techNews}\n\n**Your Stats:** ${totalPoints} pts | ${achievements.length} achievements`;

    await sendFollowup(req, responseText);
  } catch (error) {
    logger.error('Commands', 'getMotivation failed', { error: error.message });
    await sendFollowup(req, `❌ Error generating motivation: ${error.message}`);
  }
}

/**
 * Handle /leaderboard command
 * Shows global leaderboard of top performers
 */
export async function handleLeaderboard(req, res) {
  try {
    logger.info('Commands', 'Leaderboard requested');

    // Send deferred response
    res.send({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    // Get top all-time performers
    const topAll = await mongodbService.getTeamTopContributors(10);
    
    // Get top today's performers
    const topToday = await mongodbService.getTopPerformersToday(10);

    // Format all-time leaderboard
    const allTimeLeaderboard = topAll && topAll.length > 0
      ? topAll
          .slice(0, 5)
          .map((user, idx) => {
            const medals = ['🥇', '🥈', '🥉', '#4️⃣', '#5️⃣'];
            return `${medals[idx]} <@${user.userId}> - ${user.totalPoints} pts (${user.achievementCount} achievements)`;
          })
          .join('\n')
      : 'No data yet!';

    // Format today's leaderboard
    const todayLeaderboard = topToday && topToday.length > 0
      ? topToday
          .slice(0, 5)
          .map((user, idx) => {
            const medals = ['🔥', '⭐', '💫', '✨', '🌟'];
            return `${medals[idx]} <@${user.userId}> - ${user.taskCount} tasks`;
          })
          .join('\n')
      : 'No tasks completed today yet!';

    const responseText = `**🏆 Global Leaderboard**

**🎖️ All-Time Champions:**
${allTimeLeaderboard}

**🔥 Today's Top Performers:**
${todayLeaderboard}

Keep pushing to reach the top! Every task brings you closer. 💪`;

    await sendFollowup(req, responseText);
  } catch (error) {
    logger.error('Commands', 'leaderboard failed', { error: error.message });
    await sendFollowup(req, `❌ Error generating leaderboard: ${error.message}`);
  }
}

/**
 * Handle /view-streak command
 * Shows user's current and longest streak
 */
export async function handleViewStreak(req, res) {
  try {
    const userId = req.body.member.user.id;
    const username = req.body.member.user.username;

    logger.info('Commands', 'View streak requested', { userId });

    const streak = await mongodbService.getUserStreak(userId);

    const streakStatus = streak.currentStreak >= 3
      ? '🔥 On Fire!'
      : streak.currentStreak >= 1
      ? '📈 Building!'
      : '❄️ No active streak';

    const milestoneMessage = streak.currentStreak >= 3
      ? `\n\nYou're ${streak.currentStreak} days into an amazing streak!`
      : streak.currentStreak === 2
      ? '\n\nAlmost to a 3-day streak! One more day! 💪'
      : '\n\nStart your streak today by logging a task!';

    const responseText = `**${streakStatus}**

**@${username}'s Streak:**
📊 Current Streak: ${streak.currentStreak} days
🏆 Longest Streak: ${streak.longestStreak} days
📅 Last Task: ${streak.lastTaskDate || 'Never'}${milestoneMessage}`;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: responseText,
      },
    });
  } catch (error) {
    logger.error('Commands', 'viewStreak failed', { error: error.message });
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `❌ Error: ${error.message}`,
      },
    });
  }
}

/**
 * Handle /team-stats command
 * Shows team statistics, leaderboard, and AI-generated insights
 */
export async function handleTeamStats(req, res) {
  try {
    logger.info('Commands', 'Team stats requested');

    // Send deferred response (AI analysis takes time)
    res.send({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    // Get team statistics
    const teamStats = await mongodbService.getTeamStats();

    if (!teamStats) {
      await sendFollowup(req, '📊 No team data available yet. Team members need to log some tasks first!');
      return;
    }

    // Get all user achievements for leaderboard
    const allAchievements = await mongodbService.getTeamTopContributors(5);

    // Format team stats for display
    const totalTasks = teamStats.totalTasksCompleted || 0;
    const activeMembers = teamStats.activeMembers || 0;
    const categories = teamStats.categoryBreakdown || {};

    // Format category breakdown
    const categoryList = Object.entries(categories)
      .map(([cat, count]) => `• ${cat}: ${count} tasks`)
      .join('\n');

    // Format leaderboard
    const leaderboard = allAchievements && allAchievements.length > 0
      ? allAchievements
          .slice(0, 5)
          .map((user, idx) => `${idx + 1}. <@${user.userId}> - ${user.totalPoints} pts`)
          .join('\n')
      : 'No achievements yet!';

    // Prepare data for AI analysis
    const statsMessage = `Team Statistics:
- Total Tasks Completed: ${totalTasks}
- Active Members: ${activeMembers}
- Categories: ${Object.keys(categories).join(', ')}
- Top Focus: ${Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`;

    // Get AI insights
    const insights = await groqService.getResponse(
      statsMessage,
      CONSTANTS.PROMPTS.TEAM_ANALYTICS,
      0.7,
      400
    );

    const responseText = `**📊 Team Statistics Dashboard**

**Overview:**
🎯 Total Tasks: ${totalTasks}
👥 Active Members: ${activeMembers}
📈 Categories: ${Object.keys(categories).length}

**Category Breakdown:**
${categoryList || 'No data yet'}

**🏆 Top Contributors:**
${leaderboard}

**📈 Team Insights:**
${insights}

Keep up the great work, team! 💪`;

    await sendFollowup(req, responseText);
  } catch (error) {
    logger.error('Commands', 'teamStats failed', { error: error.message });
    await sendFollowup(req, `❌ Error generating team stats: ${error.message}`);
  }
}

/**
 * Helper function to send followup messages for deferred responses
 */
async function sendFollowup(req, content) {
  try {
    const endpoint = `webhooks/${req.body.application_id}/${req.body.token}`;
    const response = await fetch(`https://discord.com/api/v10/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.warn('Commands', 'Followup send failed', { status: response.status, error });
    }
  } catch (error) {
    logger.error('Commands', 'sendFollowup error', { error: error.message });
  }
}

/**
 * Route command to appropriate handler
 */
export async function handleCommand(req, res, commandName) {
  switch (commandName) {
    case 'task-completed':
      return await handleTaskCompleted(req, res);
    case 'yesterday-summary':
      return await handleYesterdaySummary(req, res);
    case 'today-plan':
      return await handleTodayPlan(req, res);
    case 'get-motivation':
      return await handleGetMotivation(req, res);
    case 'team-stats':
      return await handleTeamStats(req, res);
    case 'view-streak':
      return await handleViewStreak(req, res);
    case 'leaderboard':
      return await handleLeaderboard(req, res);
    default:
      logger.warn('Commands', 'Unknown command', { commandName });
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Unknown command' },
      });
  }
}
