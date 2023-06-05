module.exports = (client) => {
    const loadButtons = require("../helpers/loadButtons");

    loadButtons(client);

    const emoji = require("../config.json").emojis;
    const Sentry = require("@sentry/node");

    client.logButtonError = async function(err, interaction, Discord) {
        Sentry.captureException(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.error} An error occurred!`)

        await interaction.reply({ embeds: [error], ephemeral: true });
    }

    require("dotenv").config();
}