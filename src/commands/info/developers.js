const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");

module.exports = {
	name: "developers",
	description: "Get a list of all the developers.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const devs = await devSchema.find();

            const users = [];

            for(const user of devs) {
                users.push(user._id);
            }

            if(!users.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} There are no developers!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const developers = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("💻 Developers")
                .setDescription(`<@${users.join(">, <@")}>`)

            await interaction.editReply({ embeds: [developers] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
