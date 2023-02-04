import { Client } from "discord.js";
import * as color from 'colorette'
import commandHandler from './handlers/command.handler';
import buttonHandler from './handlers/button.handler';
import config from './config';


// CREATE THE CLIENT AND LOG IN //

const client = new Client({
    intents: [ // creates the client and sets up some intents
        'GuildMessages',
        'Guilds',
        'GuildMembers',
        'DirectMessages',
        'GuildVoiceStates'
    ]
})

console.time(color.greenBright("Login")) // starts the login timer

client.login(config.DISCORD_TOKEN) // logs in using the token from the config file

client.once("ready", client => {                                            // once ready (logged in)
    console.timeEnd(color.greenBright("Login"))                             // finishes and logs the result of the login timer
    console.log(`Logged in as ${color.bgGreenBright(client.user.tag)}!`)    // logs the bots tag
})

// INITIALIZE THE HANDLERS //

export interface Handler { // creates an interface accessible from other files
    name: string;
    description?: string;
    runAfterLogin?: boolean;
    handler: (client: Client) => unknown;
}

const handlers: Handler[] = [
    commandHandler,
    buttonHandler
]

for (const handler of handlers.filter(handler => !handler.runAfterLogin)) {
    handler.handler(client)
}
client.once("ready", client => {
    for (const handler of handlers.filter(handler => handler.runAfterLogin)) {
        handler.handler(client)
    }
})

// console.log(color.bgWhite(`press ${color.bold("G")} to reload global application commands.`))