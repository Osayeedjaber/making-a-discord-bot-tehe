import { ColorResolvable } from 'discord.js';

export const COLORS = {
  PRIMARY: '#5865F2' as ColorResolvable,
  SUCCESS: '#57F287' as ColorResolvable,
  WARNING: '#FEE75C' as ColorResolvable,
  ERROR: '#ED4245' as ColorResolvable,
  INFO: '#5865F2' as ColorResolvable,
  PURPLE: '#9B59B6' as ColorResolvable,
  ORANGE: '#E67E22' as ColorResolvable,
  BLURPLE: '#7289DA' as ColorResolvable,
  TRANSPARENT: 'Default' as ColorResolvable
} as const;

export const EMOJIS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  MUSIC: '🎵',
  VOLUME: '🔊',
  MUTE: '🔇',
  PAUSE: '⏸️',
  PLAY: '▶️',
  SKIP: '⏭️',
  STOP: '⏹️',
  LOOP: '🔄',
  SHUFFLE: '🔀',
  MODERATOR: '🛡️',
  BAN: '🔨',
  KICK: '👢',
  MUTE_MEMBER: '🔇',
  LOCK: '🔒',
  UNLOCK: '🔓'
} as const;

export const PERMISSIONS = {
  MANAGE_MESSAGES: 'ManageMessages',
  MANAGE_ROLES: 'ManageRoles',
  MANAGE_CHANNELS: 'ManageChannels',
  KICK_MEMBERS: 'KickMembers',
  BAN_MEMBERS: 'BanMembers',
  MODERATE_MEMBERS: 'ModerateMembers',
  ADMINISTRATOR: 'Administrator',
  CONNECT: 'Connect',
  SPEAK: 'Speak',
  USE_VAD: 'UseVAD'
} as const;

export const TIMEOUTS = {
  COMMAND_COOLDOWN: 3000,
  MUSIC_TIMEOUT: 300000, // 5 minutes
  MODERATION_LOG_TIMEOUT: 10000,
  EMBED_TIMEOUT: 30000
} as const;