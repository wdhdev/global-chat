const fetch = require("node-fetch");

module.exports = {
    name: "sentry-resolve",
    startsWith: true,
    requiredRoles: ["dev"],
    async execute(interaction, client, Discord) {
        const id = interaction.customId.replace("sentry-resolve-", "");

        try {
            await fetch(`https://sentry.io/api/0/issues/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.sentry_bearer}`
                },
                body: JSON.stringify({
                    status: "resolved"
                })
            }).then(res => res.json())
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
            return;
        }

        const resolved = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.green)
            .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
            .setTitle("✅ Resolved")
            .setTimestamp()

        interaction.message.components[0].components[1].data.disabled = true;
        interaction.message.embeds.push(resolved);

        await interaction.deferUpdate();

        await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });
    }
}
