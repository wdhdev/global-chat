const emoji = require("../../config").emojis;

const User = require("../../models/User");

module.exports = {
    name: "moderators",
    description: "Get a list of all the moderators.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const data = await User.find({ mod: true });

            const users = [];

            for(const user of data) {
                users.push(user._id);
            }

            if(!users.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There are no moderators!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const moderators = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🔨 Moderators")
                .setDescription(`<@${users.join(">, <@")}>`)

            await interaction.editReply({ embeds: [moderators] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
