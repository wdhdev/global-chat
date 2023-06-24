module.exports = {
	name: "ready",
	once: true,
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
			const register = require("../../scripts/register");
			await register(client);

			const registered = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.green)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("📝 Registered Commands")
                .setTimestamp()

			logsChannel.send({ embeds: [registered] });

			// Cleanup Database
			// Banned Users
			const cleanBannedUsers = require("../../util/database/cleanBannedUsers");
			const bannedUsersRes = await cleanBannedUsers(client);

			const bannedUsersResult = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.default)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("🧹 Collection Cleanup")
				.setDescription("`banned-users`")
				.addFields (
					{ name: "🗑️ Removed Documents", value: bannedUsersRes.removed.length ? `\`\`\`${bannedUsersRes.removed.join("\n")}\`\`\`` : "*None*" }
				)
				.setTimestamp()

			if(bannedUsersRes.removed.length) logsChannel.send({ embeds: [bannedUsersResult] });

			// Channels
			const cleanChannels = require("../../util/database/cleanChannels");
			const channelsRes = await cleanChannels(client);

			const channelsResult = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.default)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("🧹 Collection Cleanup")
				.setDescription("`channels`")
				.addFields (
					{ name: "📝 Modified Documents", value: channelsRes.modified.length ? `\`\`\`${channelsRes.modified.join("\n")}\`\`\`` : "*None*" },
					{ name: "🗑️ Removed Documents", value: channelsRes.removed.length ? `\`\`\`${channelsRes.removed.join("\n")}\`\`\`` : "*None*" }
				)
				.setTimestamp()

			if(channelsRes.modified.length || channelsRes.removed.length) logsChannel.send({ embeds: [channelsResult] });
		} catch(err) {
			client.logEventError(err);
		}
	}
}