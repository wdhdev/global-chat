module.exports = {
    name: "credits",
    startsWith: false,
    requiredRoles: [],
    async execute(interaction, client, Discord) {
        try {
            const credits = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "💻 Developer", value: "[@william.harrison](https://discord.com/users/853158265466257448)" },
                    { name: "🪝 Webhook System", value: "[@andrewstech](https://discord.com/users/598245488977903688)" },
                    { name: "💡 Bot Inspiration", value: "[@sx9dev](https://discord.com/users/882595027132493864)" }
                )

            await interaction.reply({ embeds: [credits], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
