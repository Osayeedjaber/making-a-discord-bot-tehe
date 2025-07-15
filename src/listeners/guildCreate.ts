import { Listener } from '@sapphire/framework';
import type { Guild as DiscordGuild } from 'discord.js';
import { Guild } from '../models/Guild';
import { logger } from '../utils/logger';
import { createEmbed } from '../utils/helpers';

export class GuildCreateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'guildCreate'
    });
  }

  public async run(guild: DiscordGuild) {
    logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
    
    try {
      // Create guild document in database
      const guildDoc = await Guild.findOneAndUpdate(
        { guildId: guild.id },
        {
          guildId: guild.id,
          name: guild.name,
          prefix: process.env.BOT_PREFIX || '!',
          settings: {
            moderationEnabled: true,
            welcomeEnabled: false,
            autoRoleEnabled: false,
            musicEnabled: true,
            levelsEnabled: false
          }
        },
        { upsert: true, new: true }
      );

      logger.info(`Created database entry for guild ${guild.name}`);

      // Send welcome message to system channel if available
      if (guild.systemChannel) {
        const embed = createEmbed({
          title: '🎉 Thanks for adding me!',
          description: [
            'Hi there! I\'m a multi-purpose Discord bot with tons of features.',
            '',
            '**🚀 Quick Start:**',
            '• Use `/help` to see all commands',
            '• Use `/setup` to configure the bot',
            '• Use `/music play` to start playing music',
            '',
            '**✨ Features:**',
            '• Moderation tools',
            '• Music player',
            '• Fun commands',
            '• Server utilities',
            '• Level system',
            '',
            '**🔧 Need help?**',
            'Use `/help` or `/support` for assistance!'
          ].join('\n'),
          color: 'SUCCESS',
          footer: {
            text: `Default prefix: ${guildDoc.prefix}`
          },
          timestamp: true
        });

        await guild.systemChannel.send({ embeds: [embed] });
      }

      // Update bot activity
      if (this.container.client.user) {
        this.container.client.user.setActivity({
          name: `${this.container.client.guilds.cache.size} servers | /help`,
          type: 3 // ActivityType.Watching
        });
      }

    } catch (error) {
      logger.error(`Error handling guild create for ${guild.name}:`, error);
    }
  }
}