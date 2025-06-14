import {
  StringSelectMenuInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder as ButtonRowBuilder,
  TextChannel,
  GuildMember
} from 'discord.js';
import { ticketConfig } from '../config/ticketConfig';

export default {
  customId: 'ticket_type_select',
  async execute(interaction: StringSelectMenuInteraction) {
    const selected = interaction.values[0];
    const user = interaction.user;
    const member = interaction.member as GuildMember;

    if (selected === 'script_support') {
      const modal = new ModalBuilder()
        .setCustomId('ticket_script_support_form')
        .setTitle('Script Support Ticket');

      const tebexInput = new TextInputBuilder()
        .setCustomId('tebex_id')
        .setLabel('Tebex Transaction ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const scriptInput = new TextInputBuilder()
        .setCustomId('script_name')
        .setLabel('Script Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const frameworkInput = new TextInputBuilder()
        .setCustomId('framework')
        .setLabel('Framework (e.g. ESX, QBCore)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const versionInput = new TextInputBuilder()
        .setCustomId('script_version')
        .setLabel('Script Version')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(tebexInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(scriptInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(frameworkInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(versionInput)
      );

      return await interaction.showModal(modal);
    }

    if (selected === 'contact_devx') {
      const ticketName = `${user.username}-contact`.toLowerCase().replace(/[^a-z0-9\-]/g, '');

      const channel = await interaction.guild?.channels.create({
        name: ticketName,
        type: ChannelType.GuildText,
        parent: ticketConfig.unclaimedCategoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          },
          ...ticketConfig.supportRoles.map(roleId => ({
            id: roleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }))
        ]
      });

      if (!channel || !(channel instanceof TextChannel)) {
        return interaction.reply({
          content: '❌ Failed to create the ticket channel.',
          flags: 64
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📩 Contact DevX Ticket')
        .addFields(
          { name: '👤 User', value: `<@${user.id}> (\`${user.id}\`)`, inline: false },
          { name: '📝 Type', value: 'Contact DevX', inline: true }
        )
        .setColor('Blue')
        .setFooter({ text: 'Click a button below to manage this ticket.' })
        .setTimestamp();

      const buttons = new ButtonRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('Claim')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [buttons] });

      return interaction.reply({
        content: `✅ Your ticket has been created: <#${channel.id}>`,
        flags: 64
      });
    }
  }
};
