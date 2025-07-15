import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '@sapphire/framework';
import { PermissionFlagsBits, GuildMember } from 'discord.js';
import { createEmbed, generateCaseId, parseDuration } from '../../utils/helpers';
import { ModerationLog } from '../../models/ModerationLog';
import { COLORS, EMOJIS } from '../../utils/constants';

export class TimeoutCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Timeout a user',
      requiredUserPermissions: [PermissionFlagsBits.ModerateMembers],
      requiredClientPermissions: [PermissionFlagsBits.ModerateMembers]
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to timeout')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('duration')
            .setDescription('Duration of timeout (e.g., 1h, 30m, 1d)')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('The reason for the timeout')
            .setRequired(false)
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    
    const targetUser = interaction.options.getUser('user', true);
    const durationStr = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Parse duration
      let duration: number;
      try {
        duration = parseDuration(durationStr);
      } catch {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} Invalid duration format! Use formats like: 1h, 30m, 1d, 2w`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if duration is within limits (max 28 days)
      if (duration > 28 * 24 * 60 * 60 * 1000) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} Timeout duration cannot exceed 28 days!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if user is trying to timeout themselves
      if (targetUser.id === interaction.user.id) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot timeout yourself!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if user is trying to timeout the bot
      if (targetUser.id === interaction.client.user.id) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot timeout me!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Get target member
      const targetMember = interaction.guild.members.cache.get(targetUser.id);
      if (!targetMember) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} User is not in this server!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      const moderator = interaction.member as GuildMember;

      // Check role hierarchy
      if (targetMember.roles.highest.position >= moderator.roles.highest.position) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot timeout a user with the same or higher role!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if target user has admin permissions
      if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot timeout an administrator!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if user is already timed out
      if (targetMember.communicationDisabledUntilTimestamp && targetMember.communicationDisabledUntilTimestamp > Date.now()) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} ${targetUser.tag} is already timed out!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Send DM to user before timeout (if possible)
      try {
        await targetUser.send({
          embeds: [createEmbed({
            title: `${EMOJIS.MUTE_MEMBER} You have been timed out`,
            description: `You have been timed out in **${interaction.guild.name}**`,
            fields: [
              { name: 'Duration', value: durationStr, inline: true },
              { name: 'Reason', value: reason, inline: true },
              { name: 'Moderator', value: interaction.user.tag, inline: true }
            ],
            color: 'WARNING',
            timestamp: true
          })]
        });
      } catch {
        // User has DMs disabled or blocked the bot
      }

      // Timeout the user
      await targetMember.timeout(duration, `${reason} | Moderator: ${interaction.user.tag}`);

      // Log the timeout
      const caseId = generateCaseId();
      await ModerationLog.create({
        guildId: interaction.guild.id,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        action: 'timeout',
        reason,
        duration,
        caseId
      });

      // Send success message
      const embed = createEmbed({
        title: `${EMOJIS.MUTE_MEMBER} User Timed Out`,
        description: `**${targetUser.tag}** has been timed out`,
        fields: [
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Duration', value: durationStr, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Case ID', value: caseId, inline: true }
        ],
        color: 'WARNING',
        timestamp: true
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in timeout command:', error);
      await interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} An error occurred while trying to timeout the user.`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }
  }
}