import { Command } from '@sapphire/framework';
import { GuildMember, VoiceChannel } from 'discord.js';
import { createEmbed, isVoiceChannel } from '../../utils/helpers';
import { musicManager } from '../../utils/music';
import { COLORS, EMOJIS } from '../../utils/constants';
import * as play from 'play-dl';
import ytdl from 'ytdl-core';

export class PlayCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Play music from YouTube or other sources'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('play')
        .setDescription('Play music from YouTube or other sources')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('Song name, YouTube URL, or search query')
            .setRequired(true)
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const query = interaction.options.getString('query', true);
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

    const voiceChannel = member.voice.channel;
    if (!isVoiceChannel(voiceChannel)) {
      return interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} You need to be in a voice channel to use this command!`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }

    // Check if bot has permissions to join and speak in voice channel
    if (!voiceChannel.permissionsFor(interaction.client.user)?.has(['Connect', 'Speak'])) {
      return interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} I don't have permission to join or speak in your voice channel!`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      // Search for the song
      let songInfo;
      let isUrl = false;

      if (ytdl.validateURL(query)) {
        // Direct YouTube URL
        songInfo = await ytdl.getInfo(query);
        isUrl = true;
      } else {
        // Search query
        const searchResults = await search(query, {
          limit: 1,
          source: { youtube: 'video' }
        });

        if (!searchResults.length) {
          return interaction.editReply({
            embeds: [createEmbed({
              description: `${EMOJIS.ERROR} No results found for "${query}"`,
              color: 'ERROR'
            })]
          });
        }

        const firstResult = searchResults[0];
        songInfo = {
          videoDetails: {
            title: firstResult.title || 'Unknown',
            video_url: firstResult.url,
            lengthSeconds: firstResult.durationInSec || 0,
            thumbnails: firstResult.thumbnails || []
          }
        };
      }

      // Create track object
      const track = {
        title: songInfo.videoDetails.title,
        url: isUrl ? query : songInfo.videoDetails.video_url,
        duration: this.formatDuration((songInfo.videoDetails.lengthSeconds || 0) * 1000),
        thumbnail: songInfo.videoDetails.thumbnails?.[0]?.url || '',
        requestedBy: interaction.user.id,
        requestedAt: new Date()
      };

      // Join voice channel if not already connected
      if (!musicManager.isConnected(interaction.guild.id)) {
        await musicManager.joinChannel(voiceChannel);
      }

      // Check if music is already playing
      const queue = await musicManager.getQueue(interaction.guild.id);
      const isPlaying = musicManager.isPlaying(interaction.guild.id);

      if (isPlaying || queue.length > 0) {
        // Add to queue
        await musicManager.addToQueue(interaction.guild.id, track);
        
        const embed = createEmbed({
          title: `${EMOJIS.MUSIC} Added to Queue`,
          description: `**${track.title}** has been added to the queue`,
          fields: [
            { name: 'Duration', value: track.duration, inline: true },
            { name: 'Position in Queue', value: `${queue.length + 1}`, inline: true },
            { name: 'Requested By', value: `<@${interaction.user.id}>`, inline: true }
          ],
          thumbnail: track.thumbnail,
          color: 'SUCCESS',
          timestamp: true
        });

        await interaction.editReply({ embeds: [embed] });
      } else {
        // Play immediately
        await musicManager.playTrack(interaction.guild.id, track);
        
        const embed = createEmbed({
          title: `${EMOJIS.PLAY} Now Playing`,
          description: `**${track.title}**`,
          fields: [
            { name: 'Duration', value: track.duration, inline: true },
            { name: 'Requested By', value: `<@${interaction.user.id}>`, inline: true }
          ],
          thumbnail: track.thumbnail,
          color: 'SUCCESS',
          timestamp: true
        });

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in play command:', error);
      await interaction.editReply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} An error occurred while trying to play the song.`,
          color: 'ERROR'
        })]
      });
    }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}