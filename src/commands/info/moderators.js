const emoji = require("../../config.json").emojis;

const modSchema = require("../../models/modSchema");

module.exports = {
	name: "moderators",
	description: "Get a list of all the moderators.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const mods = await modSchema.find();

            const users = [];

            for(const user of mods) {
                users.push(user._id);
            }

            if(!users.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} There are no moderators!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const moderators = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🔨 Moderators")
                .setDescription(`<@${users.join(">\n<@")}>`)

            await interaction.editReply({ embeds: [moderators] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
