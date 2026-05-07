/**
 * Channel Setup Command Handler
 * Admin command to help organize and document channels
 * Usage: /channel-setup action: [info|guide|setup]
 */

import { InteractionResponseType } from 'discord-interactions';
import channelSetupService from '../services/channelSetupService.js';
import logger from '../services/logger.js';

export async function handleChannelSetup(req, res) {
  try {
    const userId = req.body.member?.user?.id;
    const userName = req.body.member?.user?.username;
    const { options } = req.body.data;

    const action = options?.find(o => o.name === 'action')?.value || 'info';

    logger.info('Commands/ChannelSetup', `Setup action: ${action}`, { userId });

    // Defer response for guide (long embed)
    if (action === 'guide') {
      res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });
    }

    let response;

    switch (action) {
      case 'info':
        response = handleChannelInfo(req);
        break;
      case 'guide':
        response = handleGuideGeneration(req);
        break;
      case 'setup':
        response = handleSetupInstructions(req);
        break;
      default:
        response = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Unknown action: ${action}. Use: info, guide, or setup`,
            flags: 64,
          },
        };
    }

    if (!res.headersSent) {
      res.send(response);
    }

    logger.info('Commands/ChannelSetup', `Response sent for action: ${action}`);
  } catch (error) {
    logger.error('Commands/ChannelSetup', 'Handler failed', { error: error.message });
    if (!res.headersSent) {
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Error processing channel setup. Check logs for details.',
          flags: 64,
        },
      });
    }
  }
}

function handleChannelInfo(req) {
  const channelName = req.body.channel?.name || '';

  const infoAll = channelSetupService.generateAllChannelInfo();
  const policy = infoAll[channelName];

  if (!policy) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `ℹ️ This channel (${channelName}) is not managed by the bot. It's available for general discussion.`,
        flags: 64,
      },
    };
  }

  const commandsList = policy.commands
    .map(cmd => `• ${cmd.display}`)
    .join('\n');

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [
        {
          title: `${policy.displayName}`,
          description: policy.description,
          color: policy.color,
          fields: [
            {
              name: '📋 Allowed Commands',
              value: commandsList || 'No specific commands',
              inline: false,
            },
            {
              name: '💡 Purpose',
              value:
                'This channel is dedicated to these commands to keep conversations organized and focused.',
              inline: false,
            },
            {
              name: '📌 Pro Tip',
              value: 'Check the pinned messages in this channel for more details.',
              inline: false,
            },
          ],
          footer: {
            text: `${policy.commands.length} command${policy.commands.length !== 1 ? 's' : ''} available in this channel`,
            icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}

function handleGuideGeneration(req) {
  const guideEmbeds = channelSetupService.getServerSetupGuide();

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: '📚 **MCP Bot - Complete Channel Organization Guide**\n\nRead below for details on each channel and how to use them.',
      embeds: guideEmbeds.slice(0, 10), // Discord limit is 10 embeds per message
    },
  };
}

function handleSetupInstructions(req) {
  const setupSteps = [
    {
      title: '🛠️ MCP Bot Channel Setup Instructions',
      description: 'Follow these steps to organize your Discord server for MCP Bot',
      color: 0x2ecc71,
      fields: [
        {
          name: '📍 Step 1: Create Channels',
          value:
            '```\n📅 daily-tasks\n👥 team\n🔨 dev-tracking\n💬 chat-with-ia\n📚 mcp-learning\n📍 general\n📖 documentation\n🎯 announcements\n```\n(Or rename existing channels)',
          inline: false,
        },
        {
          name: '🔐 Step 2: Set Permissions',
          value:
            '• Set each channel visible to team members\n• Restrict #announcements to admin post-only\n• Keep #documentation read-only for team',
          inline: false,
        },
        {
          name: '📌 Step 3: Pin Info Messages',
          value:
            '• Run `/channel-setup action: guide` in each channel\n• Right-click message → Pin message\n• Do this for all 8 channels',
          inline: false,
        },
        {
          name: '📢 Step 4: Announce',
          value:
            '• Post in #announcements explaining channel structure\n• Send onboarding guide to new members\n• Share the organization guide from #documentation',
          inline: false,
        },
      ],
    },
    {
      title: '📝 Command Copy-Paste',
      description: 'Run these commands in each channel to set them up',
      color: 0x3498db,
      fields: [
        {
          name: '📅 In #daily-tasks',
          value: '```\n/channel-setup action: info\n```\nThen pin the message',
          inline: false,
        },
        {
          name: '👥 In #team',
          value: '```\n/channel-setup action: info\n```\nThen pin the message',
          inline: false,
        },
        {
          name: '🔨 In #dev-tracking',
          value: '```\n/channel-setup action: info\n```\nThen pin the message',
          inline: false,
        },
        {
          name: '💬 In #chat-with-ia',
          value: '```\n/channel-setup action: info\n```\nThen pin the message',
          inline: false,
        },
        {
          name: '📚 In #mcp-learning',
          value: '```\n/channel-setup action: info\n```\nThen pin the message',
          inline: false,
        },
        {
          name: '📖 In #documentation',
          value: '```\n/channel-setup action: guide\n```\nThis posts the full guide',
          inline: false,
        },
      ],
    },
    {
      title: '✅ Verification Checklist',
      description: 'After setup, verify everything works',
      color: 0x27ae60,
      fields: [
        {
          name: 'Test Commands',
          value:
            '✅ Try `/task-completed` in #daily-tasks (should work)\n✅ Try `/get-motivation` in #dev-tracking (should fail with helpful message)\n✅ Try `/today-plan` in #daily-tasks (should work)',
          inline: false,
        },
        {
          name: 'Test Messages',
          value:
            '✅ Check all channel info messages are pinned\n✅ Read pinned messages to verify they make sense\n✅ Verify role permissions are correct',
          inline: false,
        },
        {
          name: 'Team Communication',
          value:
            '✅ Post announcement explaining changes\n✅ Send onboarding to team members\n✅ Answer questions about channel usage',
          inline: false,
        },
      ],
    },
  ];

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: '🛠️ **MCP Bot Setup Guide** - Follow the steps below to organize your Discord server',
      embeds: setupSteps,
    },
  };
}
