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
  {
    name: 'challenge',
    description: 'Challenge to rock paper scissors',
    options: [
      {
        type: 3,
        name: 'object',
        description: 'Pick your object',
        required: true,
        choices: [
          { name: 'Rock', value: 'rock' },
          { name: 'Paper', value: 'paper' },
          { name: 'Scissors', value: 'scissors' },
        ],
      },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 2],
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
];

const ALL_COMMANDS = [...DAILY_TRACKING_COMMANDS, ...LEGACY_COMMANDS, ...MCP_COMMANDS];

console.log('📋 Registering Discord commands...');
console.log(`📝 Daily Tracking Commands: ${DAILY_TRACKING_COMMANDS.length}`);
console.log(`📝 MCP Commands: ${MCP_COMMANDS.length}`);
console.log(`📝 Legacy Commands: ${LEGACY_COMMANDS.length}`);
console.log(`📝 Total Commands: ${ALL_COMMANDS.length}`);

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

console.log('✅ Commands registered successfully!');
