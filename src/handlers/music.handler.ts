import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import config from "../config";
import { VoiceChannel } from "discord.js";
import youtubeSearch from "youtube-search"
import ytdl from "ytdl-core"
import ytpl from "ytpl"



export interface song {
    title: string;
    author: string;
    url: string;
}

let youtubeSearchOptions: youtubeSearch.YouTubeSearchOptions = {
    maxResults: 10,
    key: config.YOUTUBE_DATA_API_KEY,
};

class MusicHandler {
    private connection: VoiceConnection | undefined;

    private audioPlayer: AudioPlayer | undefined = undefined;
    private _queue: song[] = [];
    public loop = false;

    public get queue() {
        return this._queue
    }

    private current: song | undefined;

    get currentSong() {
        return this.current
    }

    public async playQueue(channel: VoiceChannel) {
        this.join(channel)
        if (this.audioPlayer?.state.status == AudioPlayerStatus.Playing) return
        while (this._queue.length) {
            const song = this._queue.shift()!
            if (this.loop) this._queue.push(song)
            await this.play(song)
        }
        this.connection?.disconnect()
    }

    public join(channel: VoiceChannel) {
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        })
    }

    public leave() {
        this.connection?.disconnect()
    }

    public pause() {
        this.audioPlayer?.pause()
    }

    public resume() {
        this.audioPlayer?.unpause()
    }

    public skip() {
        this.audioPlayer?.stop()
    }

    public async play(song: song) {
        this.current = song
        try {
            const stream = ytdl(song.url,
                {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                })
            const resource = createAudioResource(stream)
            this.audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause }, debug: true })
            this.connection?.subscribe(this.audioPlayer)
            this.audioPlayer.play(resource)
            await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5e3)
            return new Promise<void>(resolve => {
                this.audioPlayer?.on('stateChange', (_, newState) => {
                    if (newState.status == AudioPlayerStatus.Idle) {
                        resolve()
                    }
                })
            })
        } catch (error) {

            console.error(error)
        }


    }

    public async addToQueue(...songs: string[]) {
        const toAdd: song[] = []
        for (const url of songs) {
            if (ytpl.validateID(url)) {
                const playlist = await ytpl(await ytpl.getPlaylistID(url))
                for (const item of playlist.items) {
                    toAdd.push({
                        title: item.title,
                        author: item.author.name,
                        url: item.shortUrl
                    })
                }
            } else if (ytdl.validateURL(url)) {
                const details = await ytdl.getBasicInfo(url)
                if (details.videoDetails.age_restricted) continue
                toAdd.push({
                    title: details.videoDetails.title,
                    author: details.videoDetails.author.name,
                    url: details.videoDetails.video_url
                })
            } else {
                const [searchResult] = (await youtubeSearch(url, youtubeSearchOptions)).results
                toAdd.push({
                    title: searchResult.title,
                    author: searchResult.channelTitle,
                    url: searchResult.link
                })
            }
        }
        this._queue.push(...toAdd)
        return toAdd
    }
}

const handlers = new Map<string, MusicHandler>()

export const getMusicHandler = (guildId: string) => handlers.get(guildId) || handlers.set(guildId, new MusicHandler).get(guildId)!

