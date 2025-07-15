import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '@sapphire/framework';
import { PermissionFlagsBits, GuildMember, User } from 'discord.js';
import { createEmbed, generateCaseId } from '../../utils/helpers';
import { ModerationLog } from '../../models/ModerationLog';
import { COLORS, EMOJIS } from '../../utils/constants';

export class BanCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Ban a user from the server',
      requiredUserPermissions: [PermissionFlagsBits.BanMembers],
      requiredClientPermissions: [PermissionFlagsBits.BanMembers]
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to ban')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('The reason for the ban')
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName('delete-messages')
            .setDescription('Number of days of messages to delete (0-7)')
            .setMinValue(0)
            .setMaxValue(7)
            .setRequired(false)
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteMessages = interaction.options.getInteger('delete-messages') || 0;

    try {
      // Check if user is trying to ban themselves
      if (targetUser.id === interaction.user.id) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot ban yourself!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if user is trying to ban the bot
      if (targetUser.id === interaction.client.user.id) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} You cannot ban me!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Check if target is a member and get their role position
      const targetMember = interaction.guild.members.cache.get(targetUser.id);
      const moderator = interaction.member as GuildMember;

      if (targetMember) {
        // Check role hierarchy
        if (targetMember.roles.highest.position >= moderator.roles.highest.position) {
          return interaction.reply({
            embeds: [createEmbed({
              description: `${EMOJIS.ERROR} You cannot ban a user with the same or higher role!`,
              color: 'ERROR'
            })],
            ephemeral: true
          });
        }

        // Check if target user has admin permissions
        if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({
            embeds: [createEmbed({
              description: `${EMOJIS.ERROR} You cannot ban an administrator!`,
              color: 'ERROR'
            })],
            ephemeral: true
          });
        }
      }

      // Check if user is already banned
      const existingBan = await interaction.guild.bans.fetch(targetUser.id).catch(() => null);
      if (existingBan) {
        return interaction.reply({
          embeds: [createEmbed({
            description: `${EMOJIS.ERROR} ${targetUser.tag} is already banned!`,
            color: 'ERROR'
          })],
          ephemeral: true
        });
      }

      // Send DM to user before banning (if possible)
      try {
        await targetUser.send({
          embeds: [createEmbed({
            title: `${EMOJIS.BAN} You have been banned`,
            description: `You have been banned from **${interaction.guild.name}**`,
            fields: [
              { name: 'Reason', value: reason, inline: true },
              { name: 'Moderator', value: interaction.user.tag, inline: true }
            ],
            color: 'ERROR',
            timestamp: true
          })]
        });
      } catch {
        // User has DMs disabled or blocked the bot
      }

      // Ban the user
      await interaction.guild.members.ban(targetUser, {
        reason: `${reason} | Moderator: ${interaction.user.tag}`,
        deleteMessageDays: deleteMessages
      });

      // Log the ban
      const caseId = generateCaseId();
      await ModerationLog.create({
        guildId: interaction.guild.id,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        action: 'ban',
        reason,
        caseId
      });

      // Send success message
      const embed = createEmbed({
        title: `${EMOJIS.BAN} User Banned`,
        description: `**${targetUser.tag}** has been banned from the server`,
        fields: [
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Case ID', value: caseId, inline: true }
        ],
        color: 'ERROR',
        timestamp: true
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in ban command:', error);
      await interaction.reply({
        embeds: [createEmbed({
          description: `${EMOJIS.ERROR} An error occurred while trying to ban the user.`,
          color: 'ERROR'
        })],
        ephemeral: true
      });
    }
  }
}