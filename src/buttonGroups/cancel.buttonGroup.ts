import { Colors, EmbedBuilder } from "discord.js";
import { ButtonGroup } from "handlers/button.handler";

const cancelGroup: ButtonGroup = {
    id: 'cancel',
    handler(interaction) {
        interaction.update({
            embeds: [
                new EmbedBuilder({
                    title: "Cancelled",
                    color: Colors.Red
                })
            ],
            components: []
        })
    },
}

export default cancelGroup