import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction } from "discord.js";

import { noMessage } from "../../util/embeds";

import Message from "../../models/Message";

const button: Button = {
    name: "message-info",
    startsWith: true,
    requiredRoles: ["staff"],
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const id = interaction.customId.replace("message-info-", "");

            const data = await Message.findOne({ _id: id });

            if(!data) return await interaction.reply({ embeds: [noMessage], ephemeral: true });

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "🕰️ Timestamp", value: `<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}> (<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}:R>)` },
                    { name: "💬 Message ID", value: `${data._id}` },
                    { name: "👤 User ID", value: `${data.user}` },
                    { name: "🗄️ Guild ID", value: `${data.guild}` }
                )

            if(!interaction.message.components[0].components[1].data.disabled) {
                info.addFields({ name: "📤 Sent To", value: `${data.messages.length} guild${data.messages.length === 1 ? "" : "s"}` });
            }

            await interaction.reply({ embeds: [info], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}

export = button;
