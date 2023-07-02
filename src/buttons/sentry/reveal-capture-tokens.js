const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");
const sentrySchema = require("../../models/sentrySchema");

module.exports = {
    name: "sentry-reveal-capture-tokens",
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

        const data = await sentrySchema.find();

        const tokens = [];

        for(const token of data) {
            tokens.push(`\`${token._id}\``);
        }

        if(!tokens.length) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} There are no tokens!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const tokenInfo = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setTitle("🔑 Tokens")
            .setDescription(tokens.join("\n"))

        await interaction.reply({ embeds: [tokenInfo], ephemeral: true });
    }
}
