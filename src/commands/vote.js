const emoji = require("../config.json").emojis;

module.exports = {
    name: "vote",
    description: "Sends the voting links.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            const vote = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
            	.setDescription(`
                    **Vote on Top.gg**
					${emoji.reply} [Support Server](https://wdh.gg/gc-support-vote)
				`)

            await interaction.editReply({ embeds: [vote] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}