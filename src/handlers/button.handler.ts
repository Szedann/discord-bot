import { buttonGroupList } from "../buttonGroups/buttonGroupList";
import { ButtonInteraction } from "discord.js";
import { Handler } from "index";

export interface ButtonGroup {
    id: string,
    handler: (interaction: ButtonInteraction) => unknown
}

const buttonHandler: Handler = {
    name: "Button handler",
    async handler(client) {
        client.on('interactionCreate', interaction => {
            if (!interaction.isButton()) return;
            const groupId = interaction.customId.split('_')[0]
            const buttonGroup = buttonGroupList.find(buttonGroup => buttonGroup.id === groupId)
            buttonGroup?.handler(interaction)
        })
    },
}

export default buttonHandler