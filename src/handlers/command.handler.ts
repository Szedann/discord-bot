import { Handler } from "..";
import dotenv from 'dotenv'
import { REST, Routes, SlashCommandBuilder, CommandInteraction, Collection, EmbedBuilder, Client } from "discord.js";
import * as color from 'colorette'
import commandList from "../commands/_commandList";
import config from "../config";

dotenv.config({ path: "./config/.env" })


const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

// LOAD COMMANDS AND UPLOAD TO DISCORD //

export interface command { // create an interface accessible from another files used to create commands
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction) => unknown
}

const commandCollection = new Collection<string, command>(commandList.map(command => [command.data.name, command]))

console.log() // prints an empty line

console.log(color.blueBright(`Loaded ${commandList.length} command${commandList.length == 1 ? "" : "s"}:`))

for (const index in commandList) {
    const command = commandList[index]
    console.log(`|| ${color.whiteBright(parseInt(index) + 1 + ". " + command.data.name)}:\n||     → ${command.data.description}`)
}

console.log() // prints an empty line

// taken from discord.js docs and transformed a bit
export async function reloadGlobalSlashCommands() {
    try {
        console.log(color.bgYellowBright(`Started refreshing ${commandList.length} application (/) commands.`));
        console.time(color.yellowBright("Reloading global commands"))

        // The put method is used to fully refresh all commands with the current set
        await rest.put(
            Routes.applicationCommands(config.APPLICATION_ID),
            { body: commandList.map(commandList => commandList.data.toJSON()) },
        );

        console.log(`Successfully reloaded global application (/) commands.`);
        console.timeEnd(color.yellowBright("Reloading global commands"))
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
}


const commandHandler: Handler = { // object exported as the handler, accessible to other files
    name: "command handler",
    runAfterLogin: false,
    handler(client: Client<false>) {
        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return                          // make sure that the interaction came from a command
            if (!commandCollection.has(interaction.commandName)) return   // and that the command exist on this app

            try {
                await commandCollection.get(interaction.commandName)!.execute(interaction) // try execute the command
            } catch (error) {                   // in case of an error
                await interaction.followUp({    // send a followup to the interaction 
                    embeds: [
                        new EmbedBuilder({
                            color: 0xff2222,
                            title: "Internal error"
                        })
                    ]
                })
                return;
            }
        })
    },
}

export default commandHandler