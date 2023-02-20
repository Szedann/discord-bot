import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { command } from "../handlers/command.handler";
import { getMusicHandler } from "../handlers/music.handler";


export default {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Set whether the queue should loop")
        .addBooleanOption(option => option.setName("loop").setDescription("should the songs play in a loop")),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        const loop = interaction.options.get("loop", false)?.value as boolean ?? !musicHandler.loop
        musicHandler.loop = loop
        interaction.reply({
            embeds: [
                new EmbedBuilder({
                    title: `Loop ${loop ? "on" : "off"}`
                })
            ]
        })
    }
} as command