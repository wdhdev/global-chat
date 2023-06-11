const checkWebhook = require("../../util/checkWebhook");

const channelSchema = require("../../models/channelSchema");

module.exports = {
	name: "guildDelete",
	async execute(client, guild) {
        try {
            if(await channelSchema.exists({ _id: guild.id })) {
                const data = await channelSchema.findOne({ _id: guild.id });
                const valid = await checkWebhook(data.webhook);

                if(valid) await axios.delete(data.webhook);
            }

            await channelSchema.findOneAndDelete({ _id: guild.id });

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("➖ Guild Left")
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
