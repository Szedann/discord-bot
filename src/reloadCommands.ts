import { reloadGlobalSlashCommands } from "./handlers/command.handler";
import * as color from 'colorette'


(async () => {

    await reloadGlobalSlashCommands()
    console.log(color.cyan("registered commands."))
})()