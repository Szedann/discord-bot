import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getMusicHandler, MusicHandler } from "../handlers/music.handler";
import { command } from "../handlers/command.handler";
import { Button } from "../handlers/button.handler";


export default {
    data: new SlashCommandBuilder()
        .setName("controls")
        .setDescription("Control the music"),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(pausePlayButton.id)
                    .setEmoji("⏯️")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(skipButton.id)
                    .setEmoji("⏭️")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(shuffleButton.id)
                    .setEmoji("🔀")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(loopButton.id)
                    .setEmoji("🔁")
                    .setStyle(ButtonStyle.Primary),
            );

        interaction.reply({
            embeds: [generateControlsEmbed(musicHandler)],
            components: [row]
        })

    }
} as command

export function generateControlsEmbed(musicHandler: MusicHandler) {
    return new EmbedBuilder({
        title: `Currently playing: \`${musicHandler.currentSong?.title}\``,
        description: musicHandler.queue[0] && `Next up: \`${musicHandler.queue[0].title}\``,
        fields: [
            {
                name: "Loop",
                value: musicHandler.loop ? "On" : "Off"
            }
        ]
    })
}

const skipButton = new Button({
    id: "controlskip",
    async handler(interaction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        await musicHandler.skip()
        setTimeout(() => {
            interaction.update({
                embeds: [generateControlsEmbed(musicHandler)]
            })
        }, 10)

    },
})

const pausePlayButton = new Button({
    id: "controlplaypause",
    handler(interaction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        if (musicHandler.isPlaying) musicHandler.pause()
        else musicHandler.unpause()
        interaction.update({
            embeds: [generateControlsEmbed(musicHandler)]
        })
    },
})

const shuffleButton = new Button({
    id: "controlshuffle",
    handler(interaction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        if (musicHandler.isPlaying) musicHandler.pause()
        else musicHandler.unpause()
        interaction.update({
            embeds: [generateControlsEmbed(musicHandler)]
        })
    },
})

const loopButton = new Button({
    id: "controlloop",
    handler(interaction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        musicHandler.loop = !musicHandler.loop
        interaction.update({
            embeds: [generateControlsEmbed(musicHandler)]
        })
    },
})