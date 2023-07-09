const checkWebhook = require("../../util/checkWebhook");
const fetch = require("node-fetch");

const channelSchema = require("../../models/channelSchema");

module.exports = {
	name: "guildDelete",
	async execute(client, Discord, guild) {
        try {
            if(await channelSchema.exists({ _id: guild.id })) {
                const data = await channelSchema.findOne({ _id: guild.id });
                const valid = await checkWebhook(data.webhook);

                if(valid) await fetch(data.webhook, { method: "DELETE" });
            }

            await channelSchema.findOneAndDelete({ _id: guild.id });

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Left Guild")
                .setThumbnail(guild.iconURL({ format: "png", dynamic: true }))
                .addFields (
                    { name: "Name", value: `${guild.name}`, inline: true },
                    { name: "ID", value: guild.id, inline: true },
                    { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
                    { name: "Created", value: `<t:${guild.createdTimestamp.toString().slice(0, -3)}> (<t:${guild.createdTimestamp.toString().slice(0, -3)}:R>)`, inline: true },
                    { name: "Member Count", value: `${guild.memberCount}`, inline: true }
                )
                .setTimestamp()

            logsChannel.send({ embeds: [log] });
        } catch(err) {
			client.logEventError(err);
        }
    }
}
