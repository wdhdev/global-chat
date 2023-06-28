const emoji = require("../../config.json").emojis;

const messageSchema = require("../../models/messageSchema");

module.exports = {
    name: "message-info",
    startsWith: true,
    async execute(interaction, client, Discord) {
        try {
            const id = interaction.customId.replace("message-info-", "");

            if(!await messageSchema.exists({ _id: id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} No message was found with that ID!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await messageSchema.findOne({ _id: id });

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "💬 Message ID", value: `${data._id}` },
                    { name: "👤 User ID", value: `${data.user}` },
                    { name: "🗄️ Guild ID", value: `${data.guild}` }
                )

            if(!interaction.message.components[0].components[1].data.disabled) {
                info.addFields (
                    { name: "📤 Sent Messages", value: `Sent to ${data.messages.length} guild${data.messages.length === 1 ? "" : "s"}.` }
                )
            }

            await interaction.reply({ embeds: [info], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
