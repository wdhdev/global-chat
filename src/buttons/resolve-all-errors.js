const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");

module.exports = {
    name: "resolve-all-errors",
    startsWith: false,
    async execute(interaction, client, Discord) {
        const dev = await devSchema.exists({ _id: interaction.user.id });

        if(!dev) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} You do not have permission to perform this action!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        try {
            await fetch(`https://sentry.io/api/0/projects/${process.env.sentry_org}/${process.env.sentry_project}/issues/?status=unresolved`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${process.env.sentry_bearer}`
                },
                body: {
                    "status": "resolved"
                }
            }).then(res => res.json())

            console.log(res);
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
            return;
        }

        const resolved = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setDescription(`${emoji.successful} All unresolved issues have been marked as resolved!`)

        await interaction.reply({ embeds: [resolved], ephemeral: true });
    }
}
