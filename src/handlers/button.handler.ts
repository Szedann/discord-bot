import { ButtonInteraction } from "discord.js";
import { Handler } from "../index";

const buttonHandler: Handler = {
    name: "Button handler",
    async handler(client) {
        client.on('interactionCreate', interaction => {
            if (!interaction.isButton()) return;
            const args = interaction.customId.split("_")
            const button = buttonList.get(args.shift()!)
            button?.handler(interaction)
        })
    },
}

export default buttonHandler

export const buttonList = new Map<string, Button>()

export class Button {
    public constructor({ id, handler }: { id: string, handler: (interaction: ButtonInteraction) => unknown }) {
        this.id = id
        this.handler = handler
        if (buttonList.has(id)) console.warn(`Overriding action for the button id ${id}`)
        buttonList.set(id, this)
    }
    public id: string = ""
    public handler: (interaction: ButtonInteraction) => unknown = () => { }
}