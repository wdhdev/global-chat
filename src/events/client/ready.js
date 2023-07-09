module.exports = {
    name: "ready",
    once: true,
    async execute(client, Discord) {
        try {
            // Login Message
            console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? client.user.username : client.user.tag}`);

            // Register Commands
            const register = require("../../scripts/client-register");
            await register(client);
        } catch(err) {
            client.logEventError(err);
        }
    }
}
