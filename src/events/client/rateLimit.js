module.exports = {
	name: "rateLimit",
	once: false,
	async execute(client, Discord) {
        try {
			console.error("The bot's rate limit has been hit.");

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

			const warning = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.green)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                .setTitle("⚠️ Rate Limited")
                .setTimestamp()

            logsChannel.send({ embeds: [warning] });
		} catch(err) {
			client.logEventError(err);
		}
	}
}
