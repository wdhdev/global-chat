module.exports = {
	name: "guildMemberUpdate",
    ephemeral: false,
	async execute(client, Discord, oldMember, newMember) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const oldPremium = oldMember.premiumSince;
            const newPremium = newMember.premiumSince;

            if(oldMember.guild.id === client.config_default.guild && oldPremium !== newPremium) {
                if(!oldPremium && newPremium) {
                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: oldMember.guild.name, iconURL: oldMember.guild.iconURL({ format: "png", dynamic: true }) })
                        .setTitle("Role Added")
                        .addFields (
                            { name: "🎭 Role", value: "💖 Supporter" },
                            { name: "👤 User", value: `${oldMember}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                }

                if(!newPremium) {
                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: oldMember.guild.name, iconURL: oldMember.guild.iconURL({ format: "png", dynamic: true }) })
                        .setTitle("Role Removed")
                        .addFields (
                            { name: "🎭 Role", value: "💖 Supporter" },
                            { name: "👤 User", value: `${oldMember}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                }
            }
        } catch(err) {
			client.logEventError(err);
        }
    }
}
