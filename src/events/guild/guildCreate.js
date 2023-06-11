const bannedGuildSchema = require("../../models/bannedGuildSchema");

module.exports = {
	name: "guildCreate",
	async execute(client, Discord, guild) {
        try {
            if(await bannedGuildSchema.exists({ _id: guild.id })) return guild.leave();

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Joined Guild")
                .addFields (
                    { name: "Name", value: `${guild.name}`, inline: true },
                    { name: "Description", value: `${guild.description || "*None*"}`, inline: true },
                    { name: "ID", value: guild.id, inline: true },
                    { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
                    { name: "Created", value: `<t:${guild.createdTimestamp.toString().slice(0, -3)}:R>`, inline: true },
                    { name: "Member Count", value: `${guild.memberCount}`, inline: true }
                )
                .setTimestamp()

            logsChannel.send({ embeds: [log] });
        } catch(err) {
			client.logEventError(err);
        }
    }
}