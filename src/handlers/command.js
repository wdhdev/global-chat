const fs = require("fs");
const getDirs = require("../util/getDirs");

module.exports = async (client) => {
    async function loadRoot() {
        const files = fs.readdirSync(`./src/commands`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${file}`);

            client.commands.set(command.name, command);

            console.log(`Loaded Command: ${command.name}`);
        }
    }

    async function loadDir(dir) {
        const files = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${dir}/${file}`);

            client.commands.set(command.name, command);

            console.log(`Loaded Command: ${command.name}`);
        }
    }

    await loadRoot();
    (await getDirs("./src/commands")).forEach(dir => loadDir(dir));

    const emoji = require("../config.json").emojis;

    client.logCommandError = async function (err, interaction, Discord) {
        const id = client.sentry.captureException(err);
        console.error(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.cross} An error occurred!`)
            .setFooter(id)
            .setTimestamp()

        await interaction.editReply({ embeds: [error], ephemeral: true });
    }

    require("dotenv").config();
}