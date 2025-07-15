import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '@sapphire/framework';
import { PermissionFlagsBits, GuildMember } from 'discord.js';
import { createEmbed, generateCaseId } from '../../utils/helpers';
import { ModerationLog } from '../../models/ModerationLog';
import { COLORS, EMOJIS } from '../../utils/constants';

export class KickCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Kick a user from the server',
      requiredUserPermissions: [PermissionFlagsBits.KickMembers],
      requiredClientPermissions: [PermissionFlagsBits.KickMembers]
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to kick')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('The reason for the kick')
            .setRequired(false)
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Check if user is trying to kick themselves
      if (targetUser.id === interaction.user.id) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot kick yourself!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if user is trying to kick the bot
      if (targetUser.id === interaction.client.user.id) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot kick me!`,
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
            description: `${EMOJIS.ERROR} You cannot kick a user with the same or higher role!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if target user has admin permissions
      if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot kick an administrator!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if user is kickable
      if (!targetMember.kickable) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} I cannot kick this user! They may have a higher role than me.`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Send DM to user before kicking (if possible)
      try {
        await targetUser.send({
          embeds: [createEmbed({
            title: `${EMOJIS.KICK} You have been kicked`,
            description: `You have been kicked from **${interaction.guild.name}**`,
            fields: [
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

      // Kick the user
      await targetMember.kick(`${reason} | Moderator: ${interaction.user.tag}`);

      // Log the kick
      const caseId = generateCaseId();
      await ModerationLog.create({
        guildId: interaction.guild.id,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        action: 'kick',
        reason,
        caseId
      });

      // Send success message
      const embed = createEmbed({
        title: `${EMOJIS.KICK} User Kicked`,
        description: `**${targetUser.tag}** has been kicked from the server`,
        fields: [
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Case ID', value: caseId, inline: true }
        ],
        color: 'WARNING',
        timestamp: true
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in kick command:', error);
      await interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} An error occurred while trying to kick the user.`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }
  }
}