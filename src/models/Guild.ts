import { Schema, model, Document } from 'mongoose';

export interface IGuild extends Document {
  guildId: string;
  name: string;
  prefix: string;
  welcomeChannel?: string;
  modLogChannel?: string;
  autoRole?: string;
  musicChannel?: string;
  djRole?: string;
  settings: {
    moderationEnabled: boolean;
    welcomeEnabled: boolean;
    autoRoleEnabled: boolean;
    musicEnabled: boolean;
    levelsEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GuildSchema = new Schema<IGuild>({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    default: '!'
  },
  welcomeChannel: {
    type: String,
    default: null
  },
  modLogChannel: {
    type: String,
    default: null
  },
  autoRole: {
    type: String,
    default: null
  },
  musicChannel: {
    type: String,
    default: null
  },
  djRole: {
    type: String,
    default: null
  },
  settings: {
    moderationEnabled: {
      type: Boolean,
      default: true
    },
    welcomeEnabled: {
      type: Boolean,
      default: false
    },
    autoRoleEnabled: {
      type: Boolean,
      default: false
    },
    musicEnabled: {
      type: Boolean,
      default: true
    },
    levelsEnabled: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

export const Guild = model<IGuild>('Guild', GuildSchema);