const emoji = require("../../config.json").emojis;

module.exports = {
	name: "supporters",
	description: "Get a list of all the supporters.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    deferReply: true,
    ephemeral: true,
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
                    .setDescription(`${emoji.cross} There are no supporters!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const supporters = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("💖 Supporters")
                .setDescription(`<@${users.join(">, <@")}>`)

            await interaction.editReply({ embeds: [supporters] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
