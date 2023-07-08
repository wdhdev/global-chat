const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");
const messageSchema = require("../../models/messageSchema");
const modSchema = require("../../models/modSchema");

module.exports = {
	name: "Message Info",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 3,
    enabled: true,
    hidden: false,
	async execute(interaction, client, Discord) {
        try {
            const message = interaction.targetMessage;

            if(!await messageSchema.exists({ messages: message.url })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} No message was found with that ID!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await messageSchema.findOne({ messages: message.url });

            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });

            if(!mod && !dev) {
                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "🕰️ Timestamp", value: `<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}> (<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}:R>)` },
                        { name: "👤 User ID", value: `${data.user}` }
                    )

                await interaction.editReply({ embeds: [info], ephemeral: true });
                return;
            }

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "🕰️ Timestamp", value: `<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}>` },
                    { name: "💬 Message ID", value: `${data._id}` },
                    { name: "👤 User ID", value: `${data.user}` },
                    { name: "🗄️ Guild ID", value: `${data.guild}` },
                    { name: "📤 Sent Messages", value: `Sent to ${data.messages.length} guild${data.messages.length === 1 ? "" : "s"}.` }
                )

            await interaction.editReply({ embeds: [info], ephemeral: true });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}
