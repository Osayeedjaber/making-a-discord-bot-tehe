import { SapphireClient, ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';
import { connectDatabase } from './utils/database';
import { logger } from './utils/logger';

// Load environment variables
config();

// Set default behavior for application commands
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Create the client
const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ],
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  },
  loadMessageCommandListeners: true,
  loadDefaultErrorListeners: true,
  defaultPrefix: process.env.BOT_PREFIX || '!',
  caseInsensitiveCommands: true,
  caseInsensitivePrefixes: true
});

// Connect to database and start the bot
async function main() {
  try {
    await connectDatabase();
    logger.info('Connected to MongoDB successfully');
    
    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Bot logged in successfully');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await client.destroy();
  process.exit(0);
});

// Start the bot
main();

export { client };