module.exports = {
	name: "guildMemberUpdate",
	async execute(client, Discord, oldMember, newMember) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            if(oldMember.guild.id === client.config_default.guild && oldMember.premiumSince !== newMember.premiumSince) {
                if(!oldMember.premiumSince) {
                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: oldMember.guild.name, iconURL: oldMember.guild.iconURL({ format: "png", dynamic: true }) })
                        .setTitle("🎭 Role Added")
                        .addFields (
                            { name: "🎭 Role", value: "💖 Supporter" },
                            { name: "👤 User", value: `${oldMember}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                    return;
                }

                if(!newMember.premiumSince) {
                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: oldMember.guild.name, iconURL: oldMember.guild.iconURL({ format: "png", dynamic: true }) })
                        .setTitle("🎭 Role Removed")
                        .addFields (
                            { name: "🎭 Role", value: "💖 Supporter" },
                            { name: "👤 User", value: `${oldMember}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                    return;
                }
            }
        } catch(err) {
			client.logEventError(err);
        }
    }
}
