
import {
  ButtonInteraction,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
  CategoryChannel,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  GuildMember
} from 'discord.js';
import { ticketConfig } from '../../config/ticketConfig';

export default {
  customId: 'claim_ticket',
  async execute(interaction: ButtonInteraction) {
    // Ensure we're in a guild and have a guild member
    if (!interaction.guild || !interaction.member) {
      return interaction.reply({
        content: '❌ This command can only be used in a server.',
        ephemeral: true
      });
    }

    const member = interaction.member as GuildMember;
    const channel = interaction.channel as TextChannel;

    if (!channel) {
      return interaction.reply({
        content: '❌ Unable to access channel.',
        ephemeral: true
      });
    }

    // Check if user has permission to claim tickets
    const allowed = ticketConfig.claimRoles.some(roleId =>
      member.roles.cache.has(roleId)
    );

    if (!allowed) {
      return interaction.reply({
        content: '❌ You do not have permission to claim this ticket.',
        ephemeral: true
      });
    }

    const staffName = interaction.user.username;
    const guild = interaction.guild;

    const openerId = channel.topic;
    if (!openerId) {
      return interaction.reply({
        content: '❌ Cannot identify the original ticket opener.',
        ephemeral: true
      });
    }

    try {
      // Create staff category if it doesn't exist
      let staffCategory = guild.channels.cache.find(
        c =>
          c.type === ChannelType.GuildCategory &&
          c.name.toLowerCase() === `devx - ${staffName.toLowerCase()}`
      ) as CategoryChannel;

      if (!staffCategory) {
        staffCategory = await guild.channels.create({
          name: `DevX - ${staffName}`,
          type: ChannelType.GuildCategory
        });
      }

      await channel.setParent(staffCategory.id);

      await channel.permissionOverwrites.set([
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: openerId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        },
        ...ticketConfig.staffRoles.map(roleId => ({
          id: roleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }))
      ]);

      // Fetch and update the original message
      const messages = await channel.messages.fetch({ limit: 10 });
      const ticketMsg = messages.find(
        msg =>
          msg.author.id === interaction.client.user?.id &&
          msg.components.length > 0
      );

      if (ticketMsg) {
        const embed = ticketMsg.embeds[0];
        const updatedEmbed = EmbedBuilder.from(embed).setFooter({
          text: `Claimed by ${staffName}`
        });

        const row = new ActionRowBuilder<ButtonBuilder>();
        const oldRow = ticketMsg.components[0];

        // Properly handle the components from the old row
        if (oldRow && oldRow.type === ComponentType.ActionRow) {
          for (const comp of oldRow.components) {
            if (comp.type === ComponentType.Button) {
              const button = ButtonBuilder.from(comp);
              if (comp.customId === 'claim_ticket') {
                button
                  .setLabel(`Claimed by ${staffName}`)
                  .setDisabled(true)
                  .setStyle(ButtonStyle.Secondary);
              }
              row.addComponents(button);
            }
          }
        }

        await ticketMsg.edit({
          embeds: [updatedEmbed],
          components: [row]
        });
      }

      const welcomeEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('🎟️ Ticket Claimed')
        .setDescription(`Hey <@${openerId}>,\n<@${interaction.user.id}> has claimed your ticket and will assist you shortly.`)
        .setTimestamp();

      await channel.send({ embeds: [welcomeEmbed] });

      await interaction.reply({
        content: '✅ You have claimed this ticket.',
        ephemeral: true
      });

    } catch (error) {
      console.error('Error claiming ticket:', error);
      await interaction.reply({
        content: '❌ An error occurred while claiming the ticket.',
        ephemeral: true
      });
    }
  }
};
