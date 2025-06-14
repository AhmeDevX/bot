import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember
} from 'discord.js';
import { ticketConfig } from '../../config/ticketConfig';

export default {
  customId: 'close_ticket',
  async execute(interaction: ButtonInteraction) {
    const member = interaction.member as GuildMember;

    // Check if user has a role allowed to close tickets
    const hasPermission = member.roles.cache.some(role =>
      ticketConfig.allowedToUseTicketButtons.includes(role.id)
    );

    if (!hasPermission) {
      return await interaction.reply({
        content: '❌ You do not have permission to use this button.',
        flags: 64
      });
    }

    const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_close_ticket')
        .setLabel('✅ Confirm Close')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_close_ticket')
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Confirm Ticket Closure')
      .setDescription('Are you sure you want to close this ticket? This cannot be undone.')
      .setColor('Red');

    await interaction.reply({
      embeds: [embed],
      components: [confirmRow],
      flags: 64
    });
  }
};
