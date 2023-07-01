const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");

module.exports = {
    name: "capture-url",
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

        const id = interaction.customId.replace("capture-url-", "");

        const url = `https://gc-sentry-api.wdh.gg/${id}`;

        const embed = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setDescription(url)
            
        const actions = new Discord.ActionRowBuilder()
            .addComponents (
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setEmoji("ℹ️")
                    .setLabel("Info")
                    .setURL(url)
            )

        await interaction.reply({ embeds: [embed], components: [actions], ephemeral: true });
    }
}
