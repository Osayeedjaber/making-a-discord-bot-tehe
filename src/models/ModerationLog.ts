import { Schema, model, Document } from 'mongoose';

export interface IModerationLog extends Document {
  guildId: string;
  userId: string;
  moderatorId: string;
  action: 'ban' | 'unban' | 'kick' | 'mute' | 'unmute' | 'warn' | 'clearwarn' | 'timeout' | 'untimeout';
  reason: string;
  duration?: number;
  evidence?: string;
  caseId: string;
  createdAt: Date;
}

const ModerationLogSchema = new Schema<IModerationLog>({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  moderatorId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['ban', 'unban', 'kick', 'mute', 'unmute', 'warn', 'clearwarn', 'timeout', 'untimeout']
  },
  reason: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: null
  },
  evidence: {
    type: String,
    default: null
  },
  caseId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

export const ModerationLog = model<IModerationLog>('ModerationLog', ModerationLogSchema);