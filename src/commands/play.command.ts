import { ChannelType, Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { command } from "../handlers/command.handler";
import { getMusicHandler } from "../handlers/music.handler";
import ytdl from "ytdl-core";


export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("play a song")
        .addStringOption(option => option.setName("song").setDescription("song name or an url").setRequired(true))
        .addBooleanOption(option => option.setName("now").setDescription("should the song ignore the queue")),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId) return interaction.reply("This command must be used on a server")
        const musicHandler = getMusicHandler(interaction.guildId)

        const channel = (await interaction.guild?.members.fetch(interaction.user.id))!.voice.channel
        const now = interaction.options.get("now", false)
        if (!channel || channel.type != ChannelType.GuildVoice) return interaction.reply("You have to in a voice channel in order to use this command")
        interaction.reply("Searching for song...")
        const added = await musicHandler.addToQueue(interaction.options.get("song", true).value as string)
        const emb = new EmbedBuilder({ color: Colors.Purple })

        musicHandler.playQueue(channel)
        if (added.length == 1) {
            const song = added[0]
            const details = await (await ytdl.getInfo(song.url)).videoDetails
            emb.setTitle(`Added "${details.title} to queue"`)
                .setImage(details.thumbnails[0].url)
                .setURL(details.video_url)
                .addFields(
                    { name: 'Author', value: details.author.name, inline: true },
                    { name: 'Views', value: details.viewCount, inline: true },
                )
            return interaction.editReply({ embeds: [emb], content: "" })
        }


        emb.setTitle('Added songs:')
            .setDescription(added.map((song, index) => `${index + 1}.${song.title} by ${song.author}`).join('\n'))
        let description = ""
        for (const index in added) {
            const song = added[index]
            const str = `${parseInt(index) + 1}.${song.title} by ${song.author}\n`
            const moreMessage = `and ${added.length - parseInt(index)} more...`
            if (description.length + str.length + moreMessage.length > 4096 || parseInt(index) >= 20) {
                description += moreMessage
                break
            }
            description += str
        }

        emb.setDescription(description)
        interaction.editReply({ embeds: [emb], content: "" })

    }
} as command