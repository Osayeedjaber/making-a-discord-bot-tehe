import { Command } from '@sapphire/framework';
import { createEmbed, formatTime } from '../../utils/helpers';
import { COLORS, EMOJIS } from '../../utils/constants';

export class ServerInfoCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Get information about the server'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('serverinfo')
        .setDescription('Get information about the server')
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} This command can only be used in a server!`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }

    const guild = interaction.guild;
    
    // Fetch guild owner
    const owner = await guild.fetchOwner();
    
    // Count channels by type
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;
    const categories = channels.filter(c => c.type === 4).size;
    
    // Count members by status
    const members = guild.members.cache;
    const humans = members.filter(m => !m.user.bot).size;
    const bots = members.filter(m => m.user.bot).size;
    
    // Get boosts info
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount || 0;
    
    // Get verification level
    const verificationLevels = {
      0: 'None',
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Very High'
    };
    
    const embed = createEmbed({
      title: `${EMOJIS.INFO} Server Information`,
      thumbnail: guild.iconURL({ size: 1024 }) || undefined,
      fields: [
        {
          name: '🏷️ Basic Info',
          value: [
            `**Name:** ${guild.name}`,
            `**ID:** ${guild.id}`,
            `**Owner:** ${owner.user.tag}`,
            `**Created:** ${formatTime(guild.createdTimestamp)}`
          ].join('\n'),
          inline: false
        },
        {
          name: '👥 Members',
          value: [
            `**Total:** ${guild.memberCount}`,
            `**Humans:** ${humans}`,
            `**Bots:** ${bots}`
          ].join('\n'),
          inline: true
        },
        {
          name: '📝 Channels',
          value: [
            `**Text:** ${textChannels}`,
            `**Voice:** ${voiceChannels}`,
            `**Categories:** ${categories}`
          ].join('\n'),
          inline: true
        },
        {
          name: '🛡️ Security',
          value: [
            `**Verification Level:** ${verificationLevels[guild.verificationLevel]}`,
            `**2FA Required:** ${guild.mfaLevel === 1 ? 'Yes' : 'No'}`,
            `**Explicit Filter:** ${guild.explicitContentFilter === 0 ? 'Disabled' : 'Enabled'}`
          ].join('\n'),
          inline: true
        },
        {
          name: '💎 Boosts',
          value: [
            `**Level:** ${boostLevel}`,
            `**Boosts:** ${boostCount}`,
            `**Boosters:** ${guild.members.cache.filter(m => m.premiumSince).size}`
          ].join('\n'),
          inline: true
        },
        {
          name: '🎭 Other',
          value: [
            `**Roles:** ${guild.roles.cache.size}`,
            `**Emojis:** ${guild.emojis.cache.size}`,
            `**Stickers:** ${guild.stickers.cache.size}`
          ].join('\n'),
          inline: true
        }
      ],
      color: 'INFO',
      footer: {
        text: `Server ID: ${guild.id}`
      },
      timestamp: true
    });

    await interaction.reply({ embeds: [embed] });
  }
}