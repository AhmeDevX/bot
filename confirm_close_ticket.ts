// interactions/buttons/confirm_close_ticket.ts

import {
  ButtonInteraction,
  EmbedBuilder,
  ChannelType,
  TextChannel
} from 'discord.js';
import { ticketConfig } from '../../config/ticketConfig';

export default {
  customId: 'confirm_close_ticket',
  async execute(interaction: ButtonInteraction) {
    const channel = interaction.channel as TextChannel;

    // Extract basic data
    const ticketName = channel.name;
    const closedBy = interaction.user;

    // Notify the ticket channel
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Red')
          .setTitle('🎟️ Ticket Closed')
          .setDescription(`This ticket was closed by <@${closedBy.id}>. Channel will be deleted in 5 seconds.`)
          .setTimestamp()
      ]
    });

    // Send log to ticket log channel
    const logChannel = interaction.guild?.channels.cache.get(ticketLogConfig.logChannelId);
    if (logChannel?.type === ChannelType.GuildText) {
      const logEmbed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTitle('📕 Ticket Closed')
        .addFields(
          { name: 'Ticket', value: `\`${ticketName}\``, inline: true },
          { name: 'Closed By', value: `<@${closedBy.id}> (\`${closedBy.id}\`)`, inline: true },
          { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: 'DevX Ticket System' });

      await (logChannel as TextChannel).send({ embeds: [logEmbed] });
    }

    setTimeout(() => {
      channel.delete().catch(console.error);
    }, 5000);

    await interaction.reply({ content: '✅ Ticket will be closed shortly.', flags: 64 });
  }
};
