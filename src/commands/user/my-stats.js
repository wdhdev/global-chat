const Message = require("../../models/Message");

module.exports = {
    name: "my-stats",
    description: "Get your Global Chat statistics.",
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
            const messages = await Message.find({ user: interaction.user.id });

            const stat_messages = `💬 ${messages.length} Message${messages.length === 1 ? "" : "s"}`;

            const statistics = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("📊 Statistics")
                .setDescription(`${stat_messages}`)

            await interaction.editReply({ embeds: [statistics] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
