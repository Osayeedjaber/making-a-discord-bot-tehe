import { EmbedBuilder, User, Guild, GuildMember, Role, TextChannel, VoiceChannel, CategoryChannel, NewsChannel, StageChannel, ForumChannel, MediaChannel } from 'discord.js';
import { COLORS, EMOJIS } from './constants';
import ms from 'ms';

export function createEmbed(options: {
  title?: string;
  description?: string;
  color?: keyof typeof COLORS;
  author?: { name: string; iconURL?: string };
  footer?: { text: string; iconURL?: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  thumbnail?: string;
  image?: string;
  timestamp?: boolean;
}): EmbedBuilder {
  const embed = new EmbedBuilder();

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.color) embed.setColor(COLORS[options.color]);
  if (options.author) embed.setAuthor(options.author);
  if (options.footer) embed.setFooter(options.footer);
  if (options.fields) embed.addFields(options.fields);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.timestamp) embed.setTimestamp();

  return embed;
}

export function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function formatTime(ms: number): string {
  const time = new Date(ms);
  return time.toLocaleString();
}

export function parseDuration(duration: string): number {
  const parsed = ms(duration);
  if (!parsed) throw new Error('Invalid duration format');
  return parsed;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function generateCaseId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getUserMention(userId: string): string {
  return `<@${userId}>`;
}

export function getRoleMention(roleId: string): string {
  return `<@&${roleId}>`;
}

export function getChannelMention(channelId: string): string {
  return `<#${channelId}>`;
}

export function isOwner(userId: string): boolean {
  const owners = process.env.BOT_OWNERS?.split(',') || [];
  return owners.includes(userId);
}

export function hasPermission(member: GuildMember, permission: string): boolean {
  return member.permissions.has(permission as any);
}

export function isTextChannel(channel: any): channel is TextChannel {
  return channel?.type === 0; // ChannelType.GuildText
}

export function isVoiceChannel(channel: any): channel is VoiceChannel {
  return channel?.type === 2; // ChannelType.GuildVoice
}

export function getRandomColor(): number {
  return Math.floor(Math.random() * 16777215);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}