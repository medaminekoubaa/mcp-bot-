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

const ALL_COMMANDS = [...DAILY_TRACKING_COMMANDS, ...LEGACY_COMMANDS];

console.log('📋 Registering Discord commands...');
console.log(`📝 Daily Tracking Commands: ${DAILY_TRACKING_COMMANDS.length}`);
console.log(`📝 Legacy Commands: ${LEGACY_COMMANDS.length}`);
console.log(`📝 Total Commands: ${ALL_COMMANDS.length}`);

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

console.log('✅ Commands registered successfully!');
