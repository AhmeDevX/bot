import { ButtonInteraction, EmbedBuilder } from 'discord.js';

export default {
  customId: 'cancel_close_ticket',
  async execute(interaction: ButtonInteraction) {
    try {
      await interaction.update({
        content: '',
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Ticket Closure Cancelled')
            .setDescription('The ticket will remain open.')
            .setColor('Green')
            .setTimestamp()
        ],
        components: [] // Removes confirm/cancel buttons
      });
    } catch (error) {
      console.error('❌ Error handling cancel_close_ticket:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while cancelling the ticket closure.',
          flags: 64
        });
      } else {
        await interaction.reply({
          content: 'An error occurred while cancelling the ticket closure.',
          flags: 64
        });
      }
    }
  }
};
