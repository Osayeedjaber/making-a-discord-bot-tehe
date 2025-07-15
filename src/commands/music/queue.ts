import { Command } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { createEmbed, chunk } from '../../utils/helpers';
import { musicManager } from '../../utils/music';
import { MusicQueue } from '../../models/MusicQueue';
import { COLORS, EMOJIS } from '../../utils/constants';

export class QueueCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Show the music queue'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('queue')
        .setDescription('Show the music queue')
        .addIntegerOption((option) =>
          option
            .setName('page')
            .setDescription('Page number to view')
            .setMinValue(1)
            .setRequired(false)
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const page = interaction.options.getInteger('page') || 1;

    try {
      // Get queue from database
      const musicQueue = await MusicQueue.findOne({ guildId: interaction.guild.id });
      
      if (!musicQueue || (!musicQueue.currentTrack && musicQueue.tracks.length === 0)) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} The queue is empty!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      const queue = musicQueue.tracks;
      const currentTrack = musicQueue.currentTrack;
      const itemsPerPage = 10;
      const totalPages = Math.ceil(queue.length / itemsPerPage);

      if (page > totalPages && totalPages > 0) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} Page ${page} doesn't exist! There are only ${totalPages} pages.`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageQueue = queue.slice(startIndex, endIndex);

      let description = '';

      // Add current track info
      if (currentTrack) {
        description += `**${EMOJIS.PLAY} Now Playing:**\n`;
        description += `${currentTrack.title}\n`;
        description += `*Duration: ${currentTrack.duration} | Requested by: <@${currentTrack.requestedBy}>*\n\n`;
      }

      // Add queue info
      if (pageQueue.length > 0) {
        description += `**${EMOJIS.MUSIC} Up Next:**\n`;
        pageQueue.forEach((track, index) => {
          const queuePosition = startIndex + index + 1;
          description += `**${queuePosition}.** ${track.title}\n`;
          description += `*Duration: ${track.duration} | Requested by: <@${track.requestedBy}>*\n\n`;
        });
      }

      // Calculate total duration
      const totalDuration = queue.reduce((total, track) => {
        const [minutes, seconds] = track.duration.split(':').map(Number);
        return total + (minutes * 60 + seconds);
      }, 0);

      const totalHours = Math.floor(totalDuration / 3600);
      const totalMinutes = Math.floor((totalDuration % 3600) / 60);
      const totalSeconds = totalDuration % 60;

      let totalDurationString = '';
      if (totalHours > 0) {
        totalDurationString = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
      } else {
        totalDurationString = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
      }

      const embed = createEmbed({
        title: `${EMOJIS.MUSIC} Music Queue`,
        description: description || 'Queue is empty',
        fields: [
          {
            name: 'Queue Info',
            value: [
              `**Songs in Queue:** ${queue.length}`,
              `**Total Duration:** ${totalDurationString}`,
              `**Current Page:** ${page}/${totalPages || 1}`
            ].join('\n'),
            inline: true
          },
          {
            name: 'Player Status',
            value: [
              `**Playing:** ${musicQueue.isPlaying ? 'Yes' : 'No'}`,
              `**Paused:** ${musicQueue.isPaused ? 'Yes' : 'No'}`,
              `**Looping:** ${musicQueue.isLooping ? 'Yes' : 'No'}`,
              `**Volume:** ${musicQueue.volume}%`
            ].join('\n'),
            inline: true
          }
        ],
        color: 'INFO',
        footer: {
          text: totalPages > 1 ? `Page ${page} of ${totalPages} | Use /queue <page> to navigate` : 'End of queue'
        },
        timestamp: true
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in queue command:', error);
      await interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} An error occurred while fetching the queue.`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }
  }
}