module.exports = {
	name: "rateLimit",
	once: false,
	async execute(client, Discord) {
        try {
			console.error("The bot's rate limit has been hit.");

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

			const warning = new Discord.EmbedBuilder()
                .setTitle("⚠️ Rate Limited")
                .setDescription("The bot's rate limit has been hit.")
                .setTimestamp()

            logsChannel.send({ embeds: [warning] });
		} catch(err) {
			client.logEventError(err);
		}
	}
}