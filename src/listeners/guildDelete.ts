import { Listener } from '@sapphire/framework';
import type { Guild as DiscordGuild } from 'discord.js';
import { Guild } from '../models/Guild';
import { MusicQueue } from '../models/MusicQueue';
import { logger } from '../utils/logger';

export class GuildDeleteListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'guildDelete'
    });
  }

  public async run(guild: DiscordGuild) {
    logger.info(`Left guild: ${guild.name} (${guild.id})`);
    
    try {
      // Optional: Clean up guild data from database
      // You might want to keep the data for when the bot rejoins
      await Guild.findOneAndDelete({ guildId: guild.id });
      await MusicQueue.findOneAndDelete({ guildId: guild.id });
      
      logger.info(`Cleaned up database entries for guild ${guild.name}`);

      // Update bot activity
      if (this.container.client.user) {
        this.container.client.user.setActivity({
          name: `${this.container.client.guilds.cache.size} servers | /help`,
          type: 3 // ActivityType.Watching
        });
      }

    } catch (error) {
      logger.error(`Error handling guild delete for ${guild.name}:`, error);
    }
  }
}