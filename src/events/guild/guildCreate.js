const bannedGuildSchema = require("../../models/bannedGuildSchema");

module.exports = {
	name: "guildCreate",
	async execute(client, Discord, guild) {
        try {
            if(await bannedGuildSchema.exists({ _id: guild.id })) return guild.leave();

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("➕ Guild Joined")
                .addFields (
                    { name: "🪪 Name", value: `${guild.name}` },
                    { name: "🔢 ID", value: guild.id }
                )
                .setTimestamp()

            logsChannel.send({ embeds: [log] });
        } catch(err) {
			client.logEventError(err);
        }
    }
}