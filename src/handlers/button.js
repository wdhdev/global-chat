module.exports = (client) => {
    const load = require("../helpers/loadButtons");

    load(client);

    const emoji = require("../config.json").emojis;

    client.logButtonError = async function(err, interaction, Discord) {
        client.sentry.captureException(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.error} An error occurred!`)

        await interaction.reply({ embeds: [error], ephemeral: true });
    }

    require("dotenv").config();
}