import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { command } from "../handlers/command.handler";

export default {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("leave the voice channel"),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild?.members.me?.voice.channel) return interaction.reply("not in a voice chat")
        await interaction.guild?.members.me?.voice.disconnect()
        await interaction.reply("disconnected")
    }
} as command