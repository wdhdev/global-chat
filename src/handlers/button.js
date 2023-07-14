const fs = require("fs");
const getDirs = require("../util/getDirs");

module.exports = async (client) => {
    async function loadRoot() {
        const files = fs.readdirSync(`./src/buttons`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const button = require(`../buttons/${file}`);

            client.buttons.set(button.name, button);

            console.log(`Loaded Button: ${button.name}`);
        }
    }

    async function loadDir(dir) {
        const files = fs.readdirSync(`./src/buttons/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const button = require(`../buttons/${dir}/${file}`);

            client.buttons.set(button.name, button);

            console.log(`Loaded Button: ${button.name}`);
        }
    }

    await loadRoot();
    (await getDirs("./src/buttons")).forEach(dir => loadDir(dir));

    client.logButtonError = async function (err, interaction, Discord) {
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

        await interaction.reply({ embeds: [error], ephemeral: true });
    }

    require("dotenv").config();
}