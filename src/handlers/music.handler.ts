import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnection } from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import { Handler } from "../index";
import play from 'play-dl'
import internal from "stream";

export default {
    name: "Music handler",
    handler(client) {
        client.on("voiceStateUpdate", (oldState, newState) => {
            if (!oldState.channelId || newState.channel) return
            const handler = musicHandlers.get(oldState.guild.id)
            if (!handler) return
            handler.removeListeners()
            musicHandlers.delete(oldState.guild.id)
        })
    },
} as Handler

export interface song {
    title: string;
    author: string;
    url: string;
}

class MusicHandler {
    private connection: VoiceConnection | undefined;

    private audioPlayer: AudioPlayer | undefined = undefined;
    private _queue: song[] = [];
    public loop = false;

    public removeListeners() {
        this.connection?.removeAllListeners()
        this.connection?.destroy()
        this.audioPlayer?.removeAllListeners()
    }

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
            await this.playSong(song)
            if (this.loop) this._queue.push(song)
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

    public async playSong(song: song) {
        try {
            const stream = await play.stream(song.url)
            const readableStream = stream.stream
            await this.playStream(readableStream, { song, type: stream.type })
        } catch (error) {
            console.error(error)
        }
    }

    public async playStream(stream: string | internal.Readable, options: { type?: StreamType, song?: song }) {
        this.current = options.song || { title: "unknown", author: "unknown", url: "https://0.0.0.0/" }
        const resource = createAudioResource(stream, {
            inputType: options.type
        })
        this.audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } })
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
    }

    public shuffleQueue() {
        for (let i = this._queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this._queue[i];
            this._queue[i] = this._queue[j];
            this._queue[j] = temp;
        }
    }

    public setQueueSongs(songs: song[]) {
        this._queue.splice(0, this._queue.length)
        this._queue.push(...songs)
    }

    public addSongsToQueue(songs: song[], inFront: boolean = false) {
        if (inFront) this._queue.unshift(...songs)
        else this._queue.push(...songs)
    }

    public async addToQueue(songs: string[], inFront: boolean = false) {
        const toAdd: song[] = []
        for (const url of songs) {
            const type = await play.validate(url)
            switch (type) {
                case "yt_video":
                    {
                        const data = await play.video_basic_info(url)
                        toAdd.push({
                            author: data.video_details.channel?.name || "unknown",
                            title: data.video_details.title || "unknown",
                            url: data.video_details.url
                        })
                        break
                    }
                case "yt_playlist":
                    {
                        const playlist = await play.playlist_info(url)
                        for (const video of await playlist.all_videos()) {
                            toAdd.push({
                                author: video.channel?.name || "unknown",
                                title: video.title || "unknown",
                                url: video.url
                            })
                        }
                        break
                    }
                case "search": {
                    const [data] = await play.search(url, { limit: 1 })
                    toAdd.push({
                        author: data.channel?.name || "unknown",
                        title: data.title || "unknown",
                        url: data.url
                    })
                }
            }
        }
        if (inFront) this._queue.unshift(...toAdd)
        else this._queue.push(...toAdd)
        return toAdd
    }
}

export const musicHandlers = new Map<string, MusicHandler>()

export const getMusicHandler = (guildId: string) => musicHandlers.get(guildId) || musicHandlers.set(guildId, new MusicHandler).get(guildId)!

