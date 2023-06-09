const bannedGuildSchema = require("../../models/bannedGuildSchema");

module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
        try {
			// Login Message
			console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag}`);

			// Register Commands
			const register = require("../../scripts/register");
			await register(client);

			// Check for banned guilds
			client.guilds.cache.forEach(async guild => {
				if(await bannedGuildSchema.exists({ _id: guild.id })) {
					guild.leave();
					console.log(`[ON START] Left Banned Guild: ${guild.id}`);
				}
			})
		} catch(err) {
			client.logEventError(err);
		}
	}
}