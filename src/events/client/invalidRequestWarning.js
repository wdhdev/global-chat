module.exports = {
	name: "invalidRequestWarning",
	once: false,
	async execute(client, Discord) {
        try {
			console.error("Invalid requests have been noticed and may lead to a ban.");

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

			const warning = new Discord.EmbedBuilder()
                .setTitle("⚠️ Invalid Requests")
                .setDescription("Invalid requests have been noticed and may lead to a ban.")
                .setTimestamp()

            logsChannel.send({ embeds: [warning] });
		} catch(err) {
			client.logEventError(err);
		}
	}
}