import CustomClient from "../../classes/CustomClient";

import globalCommands from "../../scripts/global-commands";

export = {
    name: "ready",
    once: true,
    async execute(client: CustomClient) {
        try {
            // Login Message
            console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? client.user.username : client.user.tag}`);

            // Register Commands
            await globalCommands(client);

            const registerGuild = require("../../scripts/guild-commands");
            await registerGuild(client);
        } catch(err) {
            client.logError(err);
        }
    }
}
