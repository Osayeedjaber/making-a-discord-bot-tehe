import { Command } from '@sapphire/framework';
import { createEmbed } from '../../utils/helpers';
import { COLORS, EMOJIS } from '../../utils/constants';

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Check bot latency and API response time'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('ping')
        .setDescription('Check bot latency and API response time')
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      embeds: [createEmbed({
        description: `${EMOJIS.LOADING} Calculating ping...`,
        color: 'INFO'
      })],
      fetchReply: true
    });

    const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(this.container.client.ws.ping);

    let latencyColor: keyof typeof COLORS = 'SUCCESS';
    let latencyEmoji: string = EMOJIS.SUCCESS;

    if (timeDiff > 200 || apiLatency > 200) {
      latencyColor = 'ERROR';
      latencyEmoji = EMOJIS.ERROR;
    } else if (timeDiff > 100 || apiLatency > 100) {
      latencyColor = 'WARNING';
      latencyEmoji = EMOJIS.WARNING;
    }

    const embed = createEmbed({
      title: `${latencyEmoji} Pong!`,
      fields: [
        {
          name: '📡 Bot Latency',
          value: `${timeDiff}ms`,
          inline: true
        },
        {
          name: '💖 API Latency',
          value: `${apiLatency}ms`,
          inline: true
        },
        {
          name: '⏱️ Uptime',
          value: this.formatUptime(this.container.client.uptime || 0),
          inline: true
        }
      ],
      color: latencyColor,
      timestamp: true
    });

    await interaction.editReply({ embeds: [embed] });
  }

  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}