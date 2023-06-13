const bannedGuildSchema = require("../../models/bannedGuildSchema");

module.exports = {
	name: "ready",
	once: true,
	async execute(client, Discord) {
        try {
			// Login Message
			console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag}`);

			// Register Commands
			const register = require("../../scripts/register");
			await register(client);

			// Check for banned guilds
			client.guilds.cache.forEach(async guild => {
				if(await bannedGuildSchema.exists({ _id: guild.id })) guild.leave();
			})

			// Cleanup Database
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

			// Banned Guilds
			const cleanBannedGuilds = require("../../util/database/cleanBannedGuilds");
			const bannedGuildsRes = await cleanBannedGuilds(client);

			const bannedGuildsResult = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.default)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("🧹 Collection Cleanup")
				.setDescription("**Collection**: `banned-guilds`")
				.addFields (
					{ name: "🗑️ Removed Documents", value: bannedGuildsRes.removed.length ? `\`\`\`${bannedGuildsRes.removed.join("\n")}\`\`\`` : "*None*" }
				)
				.setTimestamp()

			if(bannedGuildsRes.removed.length) {
				logsChannel.send({ embeds: [bannedGuildsResult] });
			}

			// Banned Users
			const cleanBannedUsers = require("../../util/database/cleanBannedUsers");
			const bannedUsersRes = await cleanBannedUsers(client);

			const bannedUsersResult = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.default)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("🧹 Collection Cleanup")
				.setDescription("**Collection**: `banned-users`")
				.addFields (
					{ name: "🗑️ Removed Documents", value: bannedUsersRes.removed.length ? `\`\`\`${bannedUsersRes.removed.join("\n")}\`\`\`` : "*None*" }
				)
				.setTimestamp()

			if(bannedUsersRes.removed.length) {
				logsChannel.send({ embeds: [bannedUsersResult] });
			}

			// Channels
			const cleanChannels = require("../../util/database/cleanChannels");
			const channelsRes = await cleanChannels(client);

			const channelsResult = new Discord.EmbedBuilder()
				.setColor(client.config_embeds.default)
				.setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
				.setTitle("🧹 Collection Cleanup")
				.setDescription("**Collection**: `channels`")
				.addFields (
					{ name: "📝 Modified Documents", value: channelsRes.modified.length ? `\`\`\`${channelsRes.modified.join("\n")}\`\`\`` : "*None*" },
					{ name: "🗑️ Removed Documents", value: channelsRes.removed.length ? `\`\`\`${channelsRes.removed.join("\n")}\`\`\`` : "*None*" }
				)
				.setTimestamp()

			if(channelsRes.modified.length || channelsRes.removed.length) {
				logsChannel.send({ embeds: [channelsResult] });
			}
		} catch(err) {
			client.logEventError(err);
		}
	}
}