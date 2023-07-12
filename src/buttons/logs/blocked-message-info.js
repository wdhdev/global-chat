const emoji = require("../../config").emojis;

const BlockedMessage = require("../../models/BlockedMessage");

module.exports = {
    name: "blocked-message-info",
    startsWith: true,
    requiredRoles: [],
    async execute(interaction, client, Discord) {
        try {
            const id = interaction.customId.replace("blocked-message-info-", "");

            const data = await BlockedMessage.findOne({ _id: id });

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

            await interaction.reply({ embeds: [info], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
