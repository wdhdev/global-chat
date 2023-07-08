module.exports = {
	name: "ready",
	once: true,
    ephemeral: false,
	async execute(client, Discord) {
        try {
			// Login Message
			console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag}`);

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

			const online = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.green)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("🟢 Bot is Online")
                .setTimestamp()

			logsChannel.send({ embeds: [online] });

			// Register Commands
			const register = require("../../scripts/client-register");
			await register(client);

			const registered = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.green)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("📝 Registered Commands")
                .setTimestamp()

			logsChannel.send({ embeds: [registered] });

			// Cleanup Database
			const clean = require("../../util/database/clean");
			await clean(client, Discord);
		} catch(err) {
			client.logEventError(err);
		}
	}
}