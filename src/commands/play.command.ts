import { ChannelType, Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { command } from "../handlers/command.handler";
import { getMusicHandler } from "../handlers/music.handler";


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
        const now = interaction.options.get("now", false)?.value as boolean
        if (!channel || channel.type != ChannelType.GuildVoice) return interaction.reply("You have to in a voice channel in order to use this command")
        await interaction.reply("Searching for song...")
        const added = await musicHandler.addToQueue([interaction.options.get("song", true).value] as [string], now)
        const emb = new EmbedBuilder({ color: Colors.Purple })
        if (!added.length) return interaction.editReply({ content: "", embeds: [emb.setTitle("Couldn't find the song")] })
        musicHandler.playQueue(channel)
        if (added.length == 1) {
            const song = added[0]
            emb.setTitle(`Added \`${song.title}\` to queue`)
                .setURL(song.url)
                .addFields(
                    { name: 'Author', value: song.author, inline: true },
                )
            return interaction.editReply({ embeds: [emb], content: "" })
        }


        emb.setTitle('Added songs:')
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