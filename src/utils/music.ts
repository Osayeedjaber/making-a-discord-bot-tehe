import { 
  createAudioPlayer, 
  createAudioResource, 
  joinVoiceChannel, 
  VoiceConnection, 
  AudioPlayer, 
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} from '@discordjs/voice';
import { VoiceChannel, Guild } from 'discord.js';
import { MusicQueue, IMusicTrack } from '../models/MusicQueue';
import { logger } from './logger';
import ytdl from 'ytdl-core';
import * as play from 'play-dl';

export class MusicManager {
  private connections: Map<string, VoiceConnection> = new Map();
  private players: Map<string, AudioPlayer> = new Map();
  private queues: Map<string, IMusicTrack[]> = new Map();

  async joinChannel(voiceChannel: VoiceChannel): Promise<VoiceConnection> {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
    });

    this.connections.set(voiceChannel.guild.id, connection);
    
    connection.on(VoiceConnectionStatus.Ready, () => {
      logger.info(`Voice connection ready in guild ${voiceChannel.guild.id}`);
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      this.connections.delete(voiceChannel.guild.id);
      this.players.delete(voiceChannel.guild.id);
      this.queues.delete(voiceChannel.guild.id);
    });

    return connection;
  }

  async leaveChannel(guildId: string): Promise<void> {
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
    }
  }

  async playTrack(guildId: string, track: IMusicTrack): Promise<void> {
    const connection = this.connections.get(guildId);
    if (!connection) {
      throw new Error('No voice connection found');
    }

    let player = this.players.get(guildId);
    if (!player) {
      player = createAudioPlayer();
      this.players.set(guildId, player);
      
      player.on(AudioPlayerStatus.Idle, () => {
        this.playNext(guildId);
      });

      player.on('error', (error) => {
        logger.error(`Audio player error in guild ${guildId}:`, error);
      });
    }

    try {
      let resource;
      
      if (track.url.includes('youtube.com') || track.url.includes('youtu.be')) {
        const stream = ytdl(track.url, {
          filter: 'audioonly',
          quality: 'highestaudio',
          highWaterMark: 1 << 25
        });
        resource = createAudioResource(stream);
      } else {
        const stream = await play.stream(track.url);
        resource = createAudioResource(stream.stream, {
          inputType: stream.type
        });
      }

      player.play(resource);
      connection.subscribe(player);

      // Update database
      await MusicQueue.findOneAndUpdate(
        { guildId },
        { 
          currentTrack: track,
          isPlaying: true,
          isPaused: false
        },
        { upsert: true }
      );

    } catch (error) {
      logger.error(`Error playing track in guild ${guildId}:`, error);
      throw error;
    }
  }

  async addToQueue(guildId: string, track: IMusicTrack): Promise<void> {
    let queue = this.queues.get(guildId) || [];
    queue.push(track);
    this.queues.set(guildId, queue);

    // Update database
    await MusicQueue.findOneAndUpdate(
      { guildId },
      { $push: { tracks: track } },
      { upsert: true }
    );
  }

  async playNext(guildId: string): Promise<void> {
    const queue = this.queues.get(guildId);
    if (!queue || queue.length === 0) {
      await this.updatePlayingStatus(guildId, false);
      return;
    }

    const nextTrack = queue.shift();
    if (nextTrack) {
      this.queues.set(guildId, queue);
      await this.playTrack(guildId, nextTrack);
      
      // Update database
      await MusicQueue.findOneAndUpdate(
        { guildId },
        { $pop: { tracks: -1 } }
      );
    }
  }

  async pause(guildId: string): Promise<void> {
    const player = this.players.get(guildId);
    if (player) {
      player.pause();
      await this.updatePlayingStatus(guildId, false, true);
    }
  }

  async resume(guildId: string): Promise<void> {
    const player = this.players.get(guildId);
    if (player) {
      player.unpause();
      await this.updatePlayingStatus(guildId, true, false);
    }
  }

  async skip(guildId: string): Promise<void> {
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
    }
  }

  async stop(guildId: string): Promise<void> {
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
      this.queues.delete(guildId);
      
      // Clear database queue
      await MusicQueue.findOneAndUpdate(
        { guildId },
        { 
          tracks: [],
          currentTrack: null,
          isPlaying: false,
          isPaused: false
        }
      );
    }
  }

  async setVolume(guildId: string, volume: number): Promise<void> {
    // Note: Volume control requires additional implementation
    // This is a placeholder for future volume control functionality
    await MusicQueue.findOneAndUpdate(
      { guildId },
      { volume: Math.max(0, Math.min(100, volume)) }
    );
  }

  async getQueue(guildId: string): Promise<IMusicTrack[]> {
    return this.queues.get(guildId) || [];
  }

  async clearQueue(guildId: string): Promise<void> {
    this.queues.delete(guildId);
    await MusicQueue.findOneAndUpdate(
      { guildId },
      { tracks: [] }
    );
  }

  async shuffle(guildId: string): Promise<void> {
    const queue = this.queues.get(guildId);
    if (queue && queue.length > 1) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      this.queues.set(guildId, shuffled);
      
      await MusicQueue.findOneAndUpdate(
        { guildId },
        { tracks: shuffled }
      );
    }
  }

  private async updatePlayingStatus(guildId: string, isPlaying: boolean, isPaused: boolean = false): Promise<void> {
    await MusicQueue.findOneAndUpdate(
      { guildId },
      { isPlaying, isPaused }
    );
  }

  isConnected(guildId: string): boolean {
    return this.connections.has(guildId);
  }

  isPlaying(guildId: string): boolean {
    const player = this.players.get(guildId);
    return player ? player.state.status === AudioPlayerStatus.Playing : false;
  }
}

export const musicManager = new MusicManager();