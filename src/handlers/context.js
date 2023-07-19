const fs = require("fs");
const getDirs = require("../util/getDirs");

module.exports = async (client) => {
    async function loadRoot() {
        const files = fs.readdirSync(`./src/context-menu`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${file}`);

            client.contextCommands.set(`${command.type}-${command.name}`, command);

            console.log(`Loaded Context Command: ${command.name}`);
        }
    }

    async function loadDir(dir) {
        const files = fs.readdirSync(`./src/context-menu/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${dir}/${file}`);

            client.contextCommands.set(`${command.type}-${command.name}`, command);

            console.log(`Loaded Context Command: ${command.name}`);
        }
    }

    await loadRoot();
    (await getDirs("./src/context-menu")).forEach(dir => loadDir(dir));

    client.logContextError = async function (err, interaction, Discord) {
        const id = client.sentry.captureException(err);
        console.error(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setTitle("💥 An error occurred")
            .setDescription(`\`\`\`${err.message}\`\`\``)
            .addFields (
                { name: "Error ID", value: id }
            )
            .setTimestamp()

        await interaction.editReply({ embeds: [error], ephemeral: true });
    }

    require("dotenv").config();
}