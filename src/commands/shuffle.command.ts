import { ChannelType, Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { command } from "../handlers/command.handler";
import { getMusicHandler } from "../handlers/music.handler";


export default {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffle the queue"),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        musicHandler.shuffleQueue()
        interaction.reply({
            embeds: [
                new EmbedBuilder({
                    title: "Shuffled the queue"
                })
            ]
        })
    }
} as command