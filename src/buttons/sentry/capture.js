const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");

module.exports = {
    name: "sentry-capture",
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

        const id = interaction.customId.replace("sentry-capture-", "");

        const info = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setDescription(`🔗 https://gc-sentry-api.wdh.gg/${id}\n🔑 ${id}`)

        await interaction.reply({ embeds: [info], ephemeral: true });
    }
}
