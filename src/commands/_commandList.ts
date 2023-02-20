import { command as Command } from "../handlers/command.handler";
import controlsCommand from "./controls.command";
import deleteCommand from "./delete.command";
import getQueueCommand from "./getQueue.command";
import leaveCommand from "./leave.command";
import loopCommand from "./loop.command";
import playCommand from "./play.command";
import shuffleCommand from "./shuffle.command";
import skipCommand from "./skip.command";

const commandList: Command[] = [
    getQueueCommand,
    leaveCommand,
    playCommand,
    deleteCommand,
    skipCommand,
    loopCommand,
    shuffleCommand,
    controlsCommand
]

export default commandList