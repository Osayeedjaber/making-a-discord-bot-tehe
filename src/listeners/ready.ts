import { Listener } from '@sapphire/framework';
import type { Client } from 'discord.js';
import { logger } from '../utils/logger';
import { ActivityType } from 'discord.js';

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: 'ready'
    });
  }

  public async run(client: Client<true>) {
    const { username, id } = client.user;
    logger.info(`Successfully logged in as ${username} (${id})`);
    
    // Set bot activity
    client.user.setActivity({
      name: `${client.guilds.cache.size} servers | /help`,
      type: ActivityType.Watching
    });

    // Log guild count
    logger.info(`Connected to ${client.guilds.cache.size} guilds`);
    
    // Log some stats
    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    logger.info(`Serving ${totalMembers} users across ${client.guilds.cache.size} guilds`);
  }
}