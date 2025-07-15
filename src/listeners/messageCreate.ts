import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { Guild } from '../models/Guild';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export class MessageCreateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'messageCreate'
    });
  }

  public async run(message: Message) {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Only process messages in guilds
    if (!message.guild) return;

    try {
      // Get guild settings
      const guildSettings = await Guild.findOne({ guildId: message.guild.id });
      
      // Handle XP/Level system if enabled
      if (guildSettings?.settings.levelsEnabled) {
        await this.handleXPGain(message);
      }

      // Handle automod features here if needed
      // await this.handleAutomod(message);

    } catch (error) {
      logger.error(`Error handling message create:`, error);
    }
  }

  private async handleXPGain(message: Message) {
    if (!message.member) return;

    try {
      const user = await User.findOneAndUpdate(
        { userId: message.author.id },
        {
          userId: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          avatar: message.author.avatar,
          $inc: { xp: Math.floor(Math.random() * 10) + 1 }
        },
        { upsert: true, new: true }
      );

      // Check if user leveled up
      const newLevel = this.calculateLevel(user.xp);
      if (newLevel > user.level) {
        user.level = newLevel;
        await user.save();

        // Send level up message
        await message.reply({
          content: `🎉 **${message.author.username}** leveled up to level **${newLevel}**!`,
          allowedMentions: { repliedUser: false }
        });
      }
    } catch (error) {
      logger.error(`Error handling XP gain:`, error);
    }
  }

  private calculateLevel(xp: number): number {
    return Math.floor(0.1 * Math.sqrt(xp));
  }
}