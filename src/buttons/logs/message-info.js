const emoji = require("../../config").emojis;

const Message = require("../../models/Message");

module.exports = {
    name: "message-info",
    startsWith: true,
    requiredRoles: [],
    async execute(interaction, client, Discord) {
        try {
            const id = interaction.customId.replace("message-info-", "");

            const data = await Message.findOne({ _id: id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} No message was found with that ID!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "🕰️ Timestamp", value: `<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}> (<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}:R>)` },
                    { name: "💬 Message ID", value: `${data._id}` },
                    { name: "👤 User ID", value: `${data.user}` },
                    { name: "🗄️ Guild ID", value: `${data.guild}` }
                )

            if(!interaction.message.components[0].components[1].data.disabled) {
                info.addFields (
                    { name: "📤 Sent To", value: `${data.messages.length} Guild${data.messages.length === 1 ? "" : "s"}` }
                )
            }

            await interaction.reply({ embeds: [info], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
