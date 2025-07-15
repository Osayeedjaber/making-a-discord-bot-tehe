import { Command } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { createEmbed } from '../../utils/helpers';
import { musicManager } from '../../utils/music';
import { COLORS, EMOJIS } from '../../utils/constants';

export class SkipCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Skip the current song'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('skip')
        .setDescription('Skip the current song')
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const member = interaction.member as GuildMember;

    // Check if user is in a voice channel
    if (!member.voice.channel) {
      return interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} You need to be in a voice channel to use this command!`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }

    // Check if bot is connected to voice
    if (!musicManager.isConnected(interaction.guild.id)) {
      return interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} I'm not connected to a voice channel!`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }

    // Check if music is playing
    if (!musicManager.isPlaying(interaction.guild.id)) {
      return interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} There's nothing playing right now!`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }

    try {
      await musicManager.skip(interaction.guild.id);

      const embed = createEmbed({
        title: `${EMOJIS.SKIP} Song Skipped`,
        description: `Skipped by <@${interaction.user.id}>`,
        color: 'SUCCESS',
        timestamp: true
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in skip command:', error);
      await interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} An error occurred while trying to skip the song.`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }
  }
}