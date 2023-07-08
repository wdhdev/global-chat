const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");

module.exports = {
	name: "announcements",
	description: "[DEVELOPER ONLY] Manage the announcement system.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 60,
    enabled: true,
    hidden: true,
    ephemeral: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });

            if(!dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const button = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Success)
                        .setCustomId("create-announcement")
                        .setLabel("Create")
                )

            await interaction.editReply({ components: [button] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
