const emoji = require("../../config.json").emojis;

module.exports = {
	name: "supporters",
	description: "Get a list of all the supporters.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const guild = await client.guilds.fetch(client.config_default.guild);
            const members = await guild.members.fetch();
            const boosters = members.filter(member => member.premiumSinceTimestamp);

            const users = [];

            for(const [userId, guildMember] of boosters) {
                users.push(userId);
            }

            if(!users.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} There are no supporters!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const supporters = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("💖 Supporters")
                .setDescription(`<@${users.join(">\n<@")}>`)

            await interaction.editReply({ embeds: [supporters] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
