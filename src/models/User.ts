import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  username: string;
  discriminator: string;
  avatar?: string;
  level: number;
  xp: number;
  coins: number;
  dailyStreak: number;
  lastDaily: Date;
  warnings: Array<{
    id: string;
    reason: string;
    moderator: string;
    date: Date;
  }>;
  infractions: Array<{
    type: 'ban' | 'kick' | 'mute' | 'warn';
    reason: string;
    moderator: string;
    duration?: number;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  discriminator: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 100
  },
  dailyStreak: {
    type: Number,
    default: 0
  },
  lastDaily: {
    type: Date,
    default: null
  },
  warnings: [{
    id: String,
    reason: String,
    moderator: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  infractions: [{
    type: {
      type: String,
      enum: ['ban', 'kick', 'mute', 'warn']
    },
    reason: String,
    moderator: String,
    duration: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const User = model<IUser>('User', UserSchema);