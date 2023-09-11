import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction } from "discord.js";

import { noMessage } from "../../util/embeds";

import BlockedMessage from "../../models/BlockedMessage";

const button: Button = {
    name: "blocked-message-info",
    startsWith: true,
    requiredRoles: ["mod"],
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: any) {
        try {
            const id = interaction.customId.replace("blocked-message-info-", "");

            const data = await BlockedMessage.findOne({ _id: id });

            if(!data) return await interaction.reply({ embeds: [noMessage], ephemeral: true });

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

export = button;
