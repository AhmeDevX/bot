import {
  StringSelectMenuInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} from 'discord.js';
import { createTicketChannel } from '../utils/ticket/createContactDevXTicket'; // assumed helper function

export default {
  customId: 'ticket_type_select',
  async execute(interaction: StringSelectMenuInteraction) {
    const selected = interaction.values[0];

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

      await interaction.showModal(modal);
    } else if (selected === 'contact_devx') {
      await interaction.deferReply({ ephemeral: true });

      try {
        await createTicketChannel(interaction); // Assumes it handles channel name, permissions, and message
        await interaction.editReply({
          content: '✅ Your DevX contact ticket has been opened!'
        });
      } catch (err) {
        console.error('❌ Error creating DevX contact ticket:', err);
        await interaction.editReply({
          content: '❌ Failed to create the ticket. Please try again later.'
        });
      }
    }
  }
};
