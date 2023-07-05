const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");

module.exports = {
    name: "sentry-capture-token",
    startsWith: true,
    async execute(interaction, client, Discord) {
        const dev = await devSchema.exists({ _id: interaction.user.id });

        if(!dev) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} You do not have permission to perform this action!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const token = interaction.customId.replace("sentry-capture-token-", "");

        const info = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .addFields (
                { name: "🔑 Token", value: token },
                { name: "🔗 URL", value: `https://gc-sentry-api.wdh.gg/${token}` }
            )

        await interaction.reply({ embeds: [info], ephemeral: true });
    }
}
