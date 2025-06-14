import {
  StringSelectMenuInteraction,
  GuildMember,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits
} from 'discord.js';
import { ticketConfig } from '../config/ticketConfig';

export default {
  customId: 'ticket_type_select',
  async execute(interaction: StringSelectMenuInteraction) {
    const selected = interaction.values[0];
    if (selected !== 'contact_devx') return;

    const member = interaction.member as GuildMember;

    if (!interaction.guild) {
      return await interaction.reply({ content: '⚠️ Guild not found.', flags: 64 });
    }

    const category = interaction.guild.channels.cache.get(ticketConfig.unclaimedCategoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return await interaction.reply({ content: '⚠️ Ticket category not found.', flags: 64 });
    }

    const channelName = ticketConfig.contactDevXNameFormat(member.user.username);
    const allowedRoles = Array.isArray(ticketConfig.allowedRoles) ? ticketConfig.allowedRoles : [];

    let channel;
    try {
      channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: member.id, // Store the user ID here for claim tracking
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          ...allowedRoles.map(roleId => ({
            id: roleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }))
        ]
      });
    } catch (error) {
      return await interaction.reply({ content: '❌ Failed to create ticket channel.', flags: 64 });
    }

    if (!channel || !('send' in channel)) {
      return await interaction.reply({ content: '❌ Failed to create ticket channel.', flags: 64 });
    }

    const embed = new EmbedBuilder()
      .setTitle('📩 New Ticket - Contact DevX')
      .setDescription(`<@${member.id}> has opened a ticket.`)
      .setColor('Blue')
      .setFooter({ text: 'DevX Ticket System' })
      .setTimestamp();

    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });

    await interaction.reply({ content: '✅ Your ticket has been created.', flags: 64 });
  }
};