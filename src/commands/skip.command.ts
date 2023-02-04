import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getMusicHandler } from "../handlers/music.handler";
import { command } from "../handlers/command.handler";


export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("get the queue"),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        const queue = musicHandler.queue
        const emb = new EmbedBuilder({
            title: "Queue:",
            description: queue.length
                ? queue.map((song, index) => `${index + 1}.${song.title} by ${song.author}`).join('\n')
                : "Queue is empty.",
            fields: [
                { name: "loop", value: musicHandler.loop ? "on" : "off" }]
        })
        interaction.reply({ embeds: [emb] })
    }
} as command