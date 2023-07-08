module.exports = (client) => {
    const load = require("../helpers/loadCommands");

    load(client);

    const emoji = require("../config.json").emojis;

    client.logCommandError = async function(err, interaction, Discord) {
        client.sentry.captureException(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.cross} An error occurred!`)

        await interaction.editReply({ embeds: [error], ephemeral: true });
    }

    require("dotenv").config();
}