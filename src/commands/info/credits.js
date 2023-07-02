module.exports = {
    name: "credits",
    description: "Credits for the bot.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            const credits = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("✨ Credits")
                .addFields (
                    { name: "💻 Developer", value: "[William Harrison](https://williamharrison.dev)" },
                    { name: "🪝 Webhook System", value: "[Andrew Beadman](https://github.com/andrewstech)" },
                    { name: "💡 Bot Inspiration", value: "[SX-9](https://sx9.is-a.dev)" }
                )

            await interaction.editReply({ embeds: [credits] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
