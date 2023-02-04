import { command as Command } from "../handlers/command.handler";
import deleteCommand from "./delete.command";
import getQueueCommand from "./getQueue.command";
import leaveCommand from "./leave.command";
import playCommand from "./play.command";

const commandList: Command[] = [
    getQueueCommand,
    leaveCommand,
    playCommand,
    deleteCommand,
]

export default commandList