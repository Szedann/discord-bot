import { command } from "../handlers/command.handler";
import { BaseGuildTextChannel, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("bulk delete messages")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName("amount").setMinValue(1).setMaxValue(100).setDescription("how many messages should be deleted").setRequired(true)),
    async execute(interaction) {
        const messages = await interaction.channel as BaseGuildTextChannel
        const amount = (interaction.options.get("amount")?.value || 5) as number
        try {
            messages.bulkDelete(amount)
            interaction.reply({ content: `Deleted last ${amount} messages`, ephemeral: true })
        } catch {
            interaction.reply({ content: "Couldn't delete messages (probably older than 2 weeks)", ephemeral: true })
        }
    }
} as command
