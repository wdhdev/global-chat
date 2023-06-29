const emoji = require("../../config.json").emojis;

const blockedSchema = require("../../models/blockedSchema");

module.exports = {
    name: "blocked-message-info",
    startsWith: true,
    async execute(interaction, client, Discord) {
        try {
            const id = interaction.customId.replace("blocked-message-info-", "");

            if(!await blockedSchema.exists({ _id: id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} No message was found with that ID!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await blockedSchema.findOne({ _id: id });

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "💬 Message ID", value: `${data._id}` },
                    { name: "👤 User ID", value: `${data.user}` },
                    { name: "🗄️ Guild ID", value: `${data.guild}` }
                )

            await interaction.reply({ embeds: [info], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
