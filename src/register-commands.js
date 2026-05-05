/**
 * Register Discord slash commands with Discord API
 * Run with: npm run register
 */

import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const DAILY_TRACKING_COMMANDS = [
  {
    name: 'task-completed',
    description: 'Log a completed task for today',
    options: [
      {
        name: 'task_name',
        description: 'What task did you complete?',
        type: 3, // STRING
        required: true,
        max_length: 100,
      },
      {
        name: 'details',
        description: 'Optional details about the task',
        type: 3, // STRING
        required: false,
        max_length: 500,
      },
      {
        name: 'category',
        description: 'Task category',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Coding', value: 'coding' },
          { name: 'Documentation', value: 'documentation' },
          { name: 'Review', value: 'review' },
          { name: 'Planning', value: 'planning' },
          { name: 'Testing', value: 'testing' },
          { name: 'Other', value: 'other' },
        ],
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'yesterday-summary',
    description: 'Get AI-powered summary of yesterday\'s work',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'today-plan',
    description: 'Plan today\'s tasks and get AI suggestions',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'get-motivation',
    description: 'Get daily motivation tips and tech news',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'team-stats',
    description: 'View team statistics, leaderboard, and analytics',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'view-streak',
    description: 'View your current and longest streaks',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'leaderboard',
    description: 'View global leaderboard of top performers',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
];

// Legacy commands (kept for compatibility)
const LEGACY_COMMANDS = [
  {
    name: 'test',
    description: 'Basic test command',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
];

// MCP Development Assistant Commands
const MCP_COMMANDS = [
  {
    name: 'dev-update',
    description: 'Log your daily development progress on MCP projects',
    options: [
      {
        name: 'project',
        description: 'Which project are you working on?',
        type: 3, // STRING
        required: true,
        choices: [
          { name: 'Career', value: 'Career' },
          { name: 'AIRA', value: 'AIRA' },
        ],
      },
      {
        name: 'task_category',
        description: 'What type of work did you do?',
        type: 3, // STRING
        required: true,
        choices: [
          { name: 'Feature Development', value: 'feature' },
          { name: 'Bug Fix', value: 'bug-fix' },
          { name: 'Documentation', value: 'documentation' },
          { name: 'Research', value: 'research' },
          { name: 'Testing', value: 'testing' },
        ],
      },
      {
        name: 'description',
        description: 'Describe what you accomplished',
        type: 3, // STRING
        required: true,
        max_length: 1000,
      },
      {
        name: 'mcp_tools',
        description: 'MCP tools you worked on (comma-separated, optional)',
        type: 3, // STRING
        required: false,
        max_length: 300,
      },
      {
        name: 'challenges',
        description: 'Challenges you faced (optional)',
        type: 3, // STRING
        required: false,
        max_length: 500,
      },
      {
        name: 'status',
        description: 'Current status of the work',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Completed', value: 'completed' },
          { name: 'In Progress', value: 'in-progress' },
          { name: 'Blocked', value: 'blocked' },
        ],
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'mcp-learn',
    description: 'Get learning tips on MCP, Docker, AI/LLM concepts',
    options: [
      {
        name: 'category',
        description: 'What topic do you want to learn?',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'MCP Basics', value: 'mcp' },
          { name: 'Docker & Containers', value: 'docker' },
          { name: 'AI & LLM', value: 'ai-llm' },
          { name: 'Tools & Integration', value: 'tools' },
        ],
      },
      {
        name: 'difficulty',
        description: 'Learning level',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Beginner', value: 'beginner' },
          { name: 'Intermediate', value: 'intermediate' },
          { name: 'Advanced', value: 'advanced' },
        ],
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'team-progress',
    description: 'View aggregated team MCP analytics and progress',
    options: [
      {
        name: 'project',
        description: 'Which project to analyze?',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Career', value: 'Career' },
          { name: 'AIRA', value: 'AIRA' },
          { name: 'Both', value: 'all' },
        ],
      },
      {
        name: 'period',
        description: 'Time period for analytics',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Today', value: 'today' },
          { name: 'This Week', value: 'week' },
          { name: 'This Month', value: 'month' },
        ],
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'daily-tip',
    description: 'Get a rotating daily educational tip',
    options: [
      {
        name: 'category',
        description: 'Tip category (optional)',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'MCP Tips', value: 'mcp' },
          { name: 'AI/LLM Tips', value: 'ai' },
          { name: 'Docker Tips', value: 'docker' },
          { name: 'Best Practices', value: 'practices' },
        ],
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'challenge-solver',
    description: 'Get help solving technical blockers',
    options: [
      {
        name: 'problem',
        description: 'Describe your technical challenge',
        type: 3, // STRING
        required: true,
        max_length: 500,
      },
      {
        name: 'context',
        description: 'Additional context (optional)',
        type: 3, // STRING
        required: false,
        max_length: 300,
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'ai-insights',
    description: 'Get AI-powered team insights and recommendations',
    options: [
      {
        name: 'metric',
        description: 'Which metric to analyze?',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Team Velocity', value: 'velocity' },
          { name: 'AI Adoption', value: 'ai-usage' },
          { name: 'Tool Usage', value: 'tools' },
          { name: 'Blockers', value: 'blockers' },
        ],
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
];

const ALL_COMMANDS = [...DAILY_TRACKING_COMMANDS, ...LEGACY_COMMANDS, ...MCP_COMMANDS];

console.log('📋 Registering Discord commands...');
console.log(`📝 Daily Tracking Commands: ${DAILY_TRACKING_COMMANDS.length}`);
console.log(`📝 MCP Commands: ${MCP_COMMANDS.length}`);
console.log(`📝 Legacy Commands: ${LEGACY_COMMANDS.length}`);
console.log(`📝 Total Commands: ${ALL_COMMANDS.length}`);

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

console.log('✅ Commands registered successfully!');
