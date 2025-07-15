import { Command } from '@sapphire/framework';
import { createEmbed, isOwner } from '../../utils/helpers';
import { COLORS, EMOJIS } from '../../utils/constants';
import { inspect } from 'util';

export class EvalCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Evaluate JavaScript code (Owner only)'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('eval')
        .setDescription('Evaluate JavaScript code (Owner only)')
        .addStringOption((option) =>
          option
            .setName('code')
            .setDescription('JavaScript code to evaluate')
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName('silent')
            .setDescription('Execute silently (no output)')
            .setRequired(false)
        )
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

    const code = interaction.options.getString('code', true);
    const silent = interaction.options.getBoolean('silent') || false;

    if (silent) {
      await interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.SUCCESS} Code executed silently.`,
          color: 'SUCCESS'
        })],
        ephemeral: true
      });
    } else {
      await interaction.deferReply();
    }

    try {
      // Create a clean context for evaluation
      const client = this.container.client;
      const guild = interaction.guild;
      const channel = interaction.channel;
      const user = interaction.user;
      const member = interaction.member;

      // Evaluate the code
      let result = eval(code);

      // Handle promises
      if (result && typeof result.then === 'function') {
        result = await result;
      }

      // Format the result
      let output = inspect(result, { depth: 0, maxArrayLength: 10 });
      
      // Truncate if too long
      if (output.length > 1900) {
        output = output.substring(0, 1900) + '...';
      }

      if (!silent) {
        const embed = createEmbed({
          title: `${EMOJIS.SUCCESS} Evaluation Successful`,
          fields: [
            {
              name: '📝 Input',
              value: `\`\`\`js\n${code.substring(0, 1000)}${code.length > 1000 ? '...' : ''}\n\`\`\``,
              inline: false
            },
            {
              name: '📤 Output',
              value: `\`\`\`js\n${output}\n\`\`\``,
              inline: false
            },
            {
              name: '🔍 Type',
              value: `\`${typeof result}\``,
              inline: true
            }
          ],
          color: 'SUCCESS',
          timestamp: true
        });

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : '';

      if (!silent) {
        const embed = createEmbed({
          title: `${EMOJIS.ERROR} Evaluation Error`,
          fields: [
            {
              name: '📝 Input',
              value: `\`\`\`js\n${code.substring(0, 1000)}${code.length > 1000 ? '...' : ''}\n\`\`\``,
              inline: false
            },
            {
              name: '❌ Error',
              value: `\`\`\`js\n${errorMessage}\n\`\`\``,
              inline: false
            },
            {
              name: '📚 Stack Trace',
              value: `\`\`\`js\n${stack?.substring(0, 1000) || 'No stack trace available'}\n\`\`\``,
              inline: false
            }
          ],
          color: 'ERROR',
          timestamp: true
        });

        await interaction.editReply({ embeds: [embed] });
      }
    }
  }
}