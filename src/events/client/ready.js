module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        try {
            // Login Message
            console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? client.user.username : client.user.tag}`);

            // Register Commands
            const registerGlobal = require("../../scripts/global-commands");
            await registerGlobal(client);

            const registerGuild = require("../../scripts/guild-commands");
            await registerGuild(client);
        } catch(err) {
            client.logError(err);
        }
    }
}
