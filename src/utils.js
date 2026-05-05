import 'dotenv/config';
import logger from './services/logger.js';

export async function DiscordRequest(endpoint, options) {
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Invalid endpoint');
  }
  if (!options || typeof options !== 'object') {
    throw new Error('Invalid options');
  }

  const url = `https://discord.com/api/v10/${endpoint}`;
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    ...options,
  });

  if (!res.ok) {
    const statusCode = res.status;
    logger.warn('Utils', `Discord API error: ${statusCode}`, { endpoint });
    throw new Error(`Discord API error: ${statusCode}`);
  }

  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  if (!appId || !Array.isArray(commands)) {
    throw new Error('Invalid appId or commands array');
  }

  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    logger.info('Utils', 'Commands installed', { count: commands.length });
  } catch (err) {
    logger.error('Utils', 'Command installation failed', { message: err.message });
    throw err;
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
