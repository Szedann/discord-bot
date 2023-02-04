import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getMusicHandler } from "../handlers/music.handler";
import { command } from "../handlers/command.handler";


export default {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("skip the current song"),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        const skipped = musicHandler.currentSong
        const next = musicHandler.queue[0]
        if (!skipped) return interaction.reply({
            embeds: [
                new EmbedBuilder({
                    title: "No song is currently playing"
                })
            ],
            ephemeral: true
        })
        musicHandler.skip()
        const embed = new EmbedBuilder({
            title: `Skipped \`${skipped.title}\`.`
        })
        if (next) embed.setDescription(`Now playing: \`${next.title}\``)

        interaction.reply({
            embeds: [embed]
        })

    }
} as command