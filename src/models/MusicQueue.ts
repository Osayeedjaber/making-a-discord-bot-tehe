import { Schema, model, Document } from 'mongoose';

export interface IMusicTrack {
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
  requestedBy: string;
  requestedAt: Date;
}

export interface IMusicQueue extends Document {
  guildId: string;
  channelId: string;
  tracks: IMusicTrack[];
  currentTrack?: IMusicTrack;
  isPlaying: boolean;
  isPaused: boolean;
  isLooping: boolean;
  volume: number;
  createdAt: Date;
  updatedAt: Date;
}

const MusicTrackSchema = new Schema<IMusicTrack>({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  requestedBy: {
    type: String,
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

const MusicQueueSchema = new Schema<IMusicQueue>({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  channelId: {
    type: String,
    required: true
  },
  tracks: [MusicTrackSchema],
  currentTrack: {
    type: MusicTrackSchema,
    default: null
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  isLooping: {
    type: Boolean,
    default: false
  },
  volume: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

export const MusicQueue = model<IMusicQueue>('MusicQueue', MusicQueueSchema);