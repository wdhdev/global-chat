module.exports = {
	name: "rateLimit",
	once: false,
    ephemeral: false,
	async execute(client, Discord) {
        try {
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
