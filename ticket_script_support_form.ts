import {
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  TextChannel,
  GuildMember
} from 'discord.js';

import { ticketConfig } from '../config/ticketConfig';

export default {
  customId: 'ticket_script_support_form',
  async execute(interaction: ModalSubmitInteraction) {
    const user = interaction.user;
    const member = interaction.member as GuildMember;

    const tebexId = interaction.fields.getTextInputValue('tebex_id');
    const scriptName = interaction.fields.getTextInputValue('script_name');
    const framework = interaction.fields.getTextInputValue('framework');
    const version = interaction.fields.getTextInputValue('script_version');

    const ticketName = `${user.username}-${scriptName}`.toLowerCase().replace(/[^a-z0-9\-]/g, '');

    // Create the ticket channel
    const channel = await interaction.guild?.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: ticketConfig.unclaimedCategoryId,
      topic: user.id, // Store user ID in topic for later reference
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
      .setTitle('🎫 Script Support Ticket')
      .addFields(
        { name: '👤 User', value: `<@${user.id}> (\`${user.id}\`)`, inline: false },
        { name: '🧾 Tebex ID', value: `\`\`\`${tebexId}\`\`\``, inline: true },
        { name: '📦 Script Name', value: `\`\`\`${scriptName}\`\`\``, inline: true },
        { name: '⚙️ Framework', value: `\`\`\`${framework}\`\`\``, inline: true },
        { name: '📄 Version', value: `\`\`\`${version}\`\`\``, inline: true }
      )
      .setColor('Blue')
      .setFooter({ text: 'Click a button below to manage this ticket.' })
      .setTimestamp();

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('Claim')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('verify_ticket')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [buttons] });

    await interaction.reply({
      content: `✅ Your ticket has been created: <#${channel.id}>`,
      flags: 64
    });
  }
};
