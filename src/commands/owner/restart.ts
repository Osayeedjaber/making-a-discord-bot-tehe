import { Command } from '@sapphire/framework';
import { createEmbed, isOwner } from '../../utils/helpers';
import { COLORS, EMOJIS } from '../../utils/constants';

export class RestartCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Restart the bot (Owner only)'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('restart')
        .setDescription('Restart the bot (Owner only)')
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    // Check if user is bot owner
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} This command is restricted to bot owners only!`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }

    const embed = createEmbed({
      title: `${EMOJIS.LOADING} Restarting Bot...`,
      description: 'The bot is restarting. Please wait a moment.',
      color: 'WARNING',
      timestamp: true
    });

    await interaction.reply({ embeds: [embed] });

    // Log the restart
    console.log(`Bot restart initiated by ${interaction.user.tag} (${interaction.user.id})`);

    // Graceful shutdown
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }
}