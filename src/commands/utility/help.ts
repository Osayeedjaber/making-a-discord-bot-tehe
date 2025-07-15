import { Command } from '@sapphire/framework';
import { createEmbed } from '../../utils/helpers';
import { COLORS, EMOJIS } from '../../utils/constants';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export class HelpCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Show help information about bot commands'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('help')
        .setDescription('Show help information about bot commands')
        .addStringOption((option) =>
          option
            .setName('category')
            .setDescription('Show commands for a specific category')
            .setRequired(false)
            .addChoices(
              { name: 'Moderation', value: 'moderation' },
              { name: 'Music', value: 'music' },
              { name: 'Fun', value: 'fun' },
              { name: 'Utility', value: 'utility' },
              { name: 'Owner', value: 'owner' }
            )
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const category = interaction.options.getString('category');

    if (category) {
      await this.showCategoryHelp(interaction, category);
    } else {
      await this.showMainHelp(interaction);
    }
  }

  private async showMainHelp(interaction: Command.ChatInputCommandInteraction) {
    const embed = createEmbed({
      title: `${EMOJIS.INFO} Bot Help`,
      description: [
        'Welcome to the help menu! Here are all the available command categories:',
        '',
        '**📚 How to use:**',
        '• Use the buttons below to navigate categories',
        '• Use `/help <category>` to view specific category commands',
        '• Use `/help` to return to this main menu'
      ].join('\n'),
      fields: [
        {
          name: `${EMOJIS.MODERATOR} Moderation`,
          value: 'Ban, kick, timeout, and other moderation tools',
          inline: true
        },
        {
          name: `${EMOJIS.MUSIC} Music`,
          value: 'Play music, manage queue, and audio controls',
          inline: true
        },
        {
          name: `${EMOJIS.SUCCESS} Fun`,
          value: 'Entertainment commands and games',
          inline: true
        },
        {
          name: `${EMOJIS.INFO} Utility`,
          value: 'Server utilities and helpful tools',
          inline: true
        },
        {
          name: `${EMOJIS.LOADING} Owner`,
          value: 'Bot owner exclusive commands',
          inline: true
        }
      ],
      color: 'INFO',
      footer: {
        text: 'Use the buttons below to navigate or use /help <category>'
      },
      timestamp: true
    });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('help_moderation')
          .setLabel('Moderation')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS.MODERATOR),
        new ButtonBuilder()
          .setCustomId('help_music')
          .setLabel('Music')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS.MUSIC),
        new ButtonBuilder()
          .setCustomId('help_fun')
          .setLabel('Fun')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎮'),
        new ButtonBuilder()
          .setCustomId('help_utility')
          .setLabel('Utility')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(EMOJIS.INFO),
        new ButtonBuilder()
          .setCustomId('help_owner')
          .setLabel('Owner')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('👑')
      );

    const response = await interaction.reply({ embeds: [embed], components: [row] });

    // Handle button interactions
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000 // 5 minutes
    });

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        await buttonInteraction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You can't use this button!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
        return;
      }

      const categoryId = buttonInteraction.customId.split('_')[1];
      await this.showCategoryHelp(buttonInteraction, categoryId);
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          ...row.components.map(button => 
            ButtonBuilder.from(button).setDisabled(true)
          )
        );
      
      interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  }

  private async showCategoryHelp(interaction: Command.ChatInputCommandInteraction | any, category: string) {
    const commands = this.getCommandsByCategory(category);
    
    if (!commands.length) {
      const embed = createEmbed({
        description: `${EMOJIS.ERROR} Category "${category}" not found or has no commands.`,
        color: 'ERROR'
      });
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = createEmbed({
      title: `${this.getCategoryEmoji(category)} ${this.capitalize(category)} Commands`,
      description: `Here are all the ${category} commands:`,
      fields: commands.map(cmd => ({
        name: `/${cmd.name}`,
        value: cmd.description,
        inline: false
      })),
      color: 'INFO',
      footer: {
        text: 'Use /help to go back to the main menu'
      },
      timestamp: true
    });

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [embed], components: [] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }

  private getCommandsByCategory(category: string) {
    const commands: Array<{name: string, description: string}> = [];

    switch (category) {
      case 'moderation':
        commands.push(
          { name: 'ban', description: 'Ban a user from the server' },
          { name: 'kick', description: 'Kick a user from the server' },
          { name: 'timeout', description: 'Timeout a user' },
          { name: 'warn', description: 'Warn a user' },
          { name: 'clear', description: 'Clear messages from a channel' }
        );
        break;
      case 'music':
        commands.push(
          { name: 'play', description: 'Play music from YouTube' },
          { name: 'skip', description: 'Skip the current song' },
          { name: 'queue', description: 'Show the music queue' },
          { name: 'pause', description: 'Pause the music' },
          { name: 'resume', description: 'Resume the music' },
          { name: 'stop', description: 'Stop the music and clear queue' },
          { name: 'volume', description: 'Set the music volume' }
        );
        break;
      case 'fun':
        commands.push(
          { name: 'ping', description: 'Check bot latency' },
          { name: '8ball', description: 'Ask the magic 8-ball a question' },
          { name: 'dice', description: 'Roll a dice' },
          { name: 'coin', description: 'Flip a coin' },
          { name: 'joke', description: 'Get a random joke' }
        );
        break;
      case 'utility':
        commands.push(
          { name: 'help', description: 'Show this help menu' },
          { name: 'userinfo', description: 'Get information about a user' },
          { name: 'serverinfo', description: 'Get information about the server' },
          { name: 'avatar', description: 'Get a user\'s avatar' },
          { name: 'invite', description: 'Get bot invite link' }
        );
        break;
      case 'owner':
        commands.push(
          { name: 'eval', description: 'Evaluate JavaScript code' },
          { name: 'restart', description: 'Restart the bot' },
          { name: 'shutdown', description: 'Shutdown the bot' },
          { name: 'reload', description: 'Reload a command' }
        );
        break;
    }

    return commands;
  }

  private getCategoryEmoji(category: string): string {
    switch (category) {
      case 'moderation': return EMOJIS.MODERATOR;
      case 'music': return EMOJIS.MUSIC;
      case 'fun': return '🎮';
      case 'utility': return EMOJIS.INFO;
      case 'owner': return '👑';
      default: return EMOJIS.INFO;
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}