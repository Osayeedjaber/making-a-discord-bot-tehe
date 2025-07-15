import { Command } from '@sapphire/framework';
import { createEmbed } from '../../utils/helpers';
import { COLORS, EMOJIS } from '../../utils/constants';

export class EightBallCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Ask the magic 8-ball a question'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption((option) =>
          option
            .setName('question')
            .setDescription('The question to ask the magic 8-ball')
            .setRequired(true)
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const question = interaction.options.getString('question', true);

    const responses = [
      // Positive responses
      'It is certain',
      'It is decidedly so',
      'Without a doubt',
      'Yes definitely',
      'You may rely on it',
      'As I see it, yes',
      'Most likely',
      'Outlook good',
      'Yes',
      'Signs point to yes',
      
      // Negative responses
      "Don't count on it",
      'My reply is no',
      'My sources say no',
      'Outlook not so good',
      'Very doubtful',
      
      // Neutral responses
      'Reply hazy, try again',
      'Ask again later',
      'Better not tell you now',
      'Cannot predict now',
      'Concentrate and ask again'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Determine color based on response type
    let color: keyof typeof COLORS = 'INFO';
    if (randomResponse.includes('yes') || randomResponse.includes('Yes') || randomResponse.includes('certain') || randomResponse.includes('definitely')) {
      color = 'SUCCESS';
    } else if (randomResponse.includes('no') || randomResponse.includes('not') || randomResponse.includes('doubtful')) {
      color = 'ERROR';
    } else {
      color = 'WARNING';
    }

    const embed = createEmbed({
      title: '🎱 Magic 8-Ball',
      fields: [
        {
          name: '❓ Question',
          value: question,
          inline: false
        },
        {
          name: '🔮 Answer',
          value: randomResponse,
          inline: false
        }
      ],
      color,
      footer: {
        text: `Asked by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      },
      timestamp: true
    });

    await interaction.reply({ embeds: [embed] });
  }
}