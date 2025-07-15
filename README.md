# Discord Bot with Sapphire Framework

A comprehensive Discord bot built with discord.js and the Sapphire framework, featuring moderation, music, fun commands, and more!

## Features

- 🛡️ **Moderation Commands** - Ban, kick, timeout, warn users
- 🎵 **Music System** - Play music from YouTube with queue management
- 🎮 **Fun Commands** - Games, jokes, and entertainment
- 🔧 **Server Utilities** - Server info, user info, and helpful tools
- 👑 **Owner Commands** - Bot management and evaluation tools
- 📊 **MongoDB Integration** - Persistent data storage
- 🎯 **Slash Commands** - Modern Discord slash command support
- 🔄 **Event System** - Comprehensive event handling

## Requirements

- Node.js 18.0.0 or higher
- MongoDB database
- Discord bot token

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discord-bot
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_bot_client_id_here
   MONGODB_URI=mongodb://localhost:27017/discord-bot
   BOT_OWNERS=your_discord_user_id_here
   ```

4. **Build the project**
   ```bash
   yarn build
   ```

5. **Start the bot**
   ```bash
   yarn start
   ```

## Development

For development with hot reload:
```bash
yarn dev
```

## Commands

### Moderation Commands
- `/ban <user> [reason]` - Ban a user from the server
- `/kick <user> [reason]` - Kick a user from the server
- `/timeout <user> <duration> [reason]` - Timeout a user
- `/warn <user> [reason]` - Warn a user
- `/clear <amount>` - Clear messages from a channel

### Music Commands
- `/play <query>` - Play music from YouTube
- `/skip` - Skip the current song
- `/queue [page]` - Show the music queue
- `/pause` - Pause the music
- `/resume` - Resume the music
- `/stop` - Stop the music and clear queue
- `/volume <level>` - Set the music volume

### Fun Commands
- `/ping` - Check bot latency
- `/8ball <question>` - Ask the magic 8-ball a question
- `/dice [sides]` - Roll a dice
- `/coin` - Flip a coin
- `/joke` - Get a random joke

### Utility Commands
- `/help [category]` - Show help information
- `/userinfo [user]` - Get information about a user
- `/serverinfo` - Get information about the server
- `/avatar [user]` - Get a user's avatar
- `/invite` - Get bot invite link

### Owner Commands
- `/eval <code>` - Evaluate JavaScript code
- `/restart` - Restart the bot
- `/shutdown` - Shutdown the bot
- `/reload <command>` - Reload a command

## Database Models

- **Guild** - Server settings and configuration
- **User** - User data, levels, and infractions
- **MusicQueue** - Music queue and player state
- **ModerationLog** - Moderation action logs

## Project Structure

```
src/
├── commands/           # Command files organized by category
│   ├── moderation/    # Moderation commands
│   ├── music/         # Music commands
│   ├── fun/           # Fun commands
│   ├── utility/       # Utility commands
│   └── owner/         # Owner-only commands
├── listeners/         # Event listeners
├── models/           # MongoDB models
├── utils/            # Utility functions and helpers
└── index.ts          # Main entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please join our Discord server or create an issue on GitHub.