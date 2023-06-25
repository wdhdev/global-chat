const emoji = require("../config.json").emojis;

module.exports = {
    name: "announcement",
    startsWith: false,
    async execute(interaction, client, Discord) {
        try {
            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription("ℹ️ This is an official announcement made by the Global Chat Developers.")

            await interaction.reply({ embeds: [info], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}