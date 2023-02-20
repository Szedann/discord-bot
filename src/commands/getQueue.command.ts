import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getMusicHandler, song } from "../handlers/music.handler";
import { command } from "../handlers/command.handler";


export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("get the queue"),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)
        const queue = musicHandler.queue
        const current = musicHandler.currentSong
        const description = queueText(queue)
        const emb = new EmbedBuilder({
            title: current
                ? `Currently playing: \`${current.title}\``
                : "Queue:",
            description: queue.length
                ? description
                : "Queue is empty.",
            fields: [
                { name: "loop", value: musicHandler.loop ? "on" : "off" }]
        })
        interaction.reply({ embeds: [emb] })
    }
} as command

export function queueText(queue: song[], beforeText: string = "Next up:") {
    let description = beforeText + "\n"
    for (const index in queue) {
        const song = queue[index]
        const str = `${parseInt(index) + 1}.${song.title} by ${song.author}\n`
        const moreMessage = `and ${queue.length - parseInt(index)} more...`
        if (description.length + str.length + moreMessage.length > 4096 || parseInt(index) >= 20) {
            description += moreMessage
            break
        }
        description += str
    }
    return description
}