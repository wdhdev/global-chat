module.exports = {
    name: "credits",
    description: "Credits for the bot.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const credits = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Credits")
                .addFields (
                    { name: "💻 Developer", value: "[@william.harrison](https://discord.com/users/853158265466257448)" },
                    { name: "🪝 Webhook System", value: "[@andrewstech](https://discord.com/users/598245488977903688)" },
                    { name: "💡 Bot Inspiration", value: "[@sx9dev](https://discord.com/users/882595027132493864)" }
                )

            await interaction.editReply({ embeds: [credits] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
