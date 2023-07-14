const getRoles = require("../../util/roles/get");

module.exports = {
    name: "my-roles",
    description: "Get your Global Chat roles.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const role = await getRoles(interaction.user.id, client);

            const roles = [];

            if(role.owner) roles.push("👑 Owner");
            if(role.dev) roles.push("💻 Developer");
            if(role.mod) roles.push("🔨 Moderator");
            if(role.verified) roles.push("✅ Verified");
            if(role.donator) roles.push("💸 Donator");
            if(role.supporter) roles.push("💖 Supporter");

            const rolesEmbed = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🎭 Roles")
                .setDescription(roles.join("\n") || "*You have no roles.*")

            await interaction.editReply({ embeds: [rolesEmbed] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
