import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { ButtonInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

import BlockedMessage from "../../models/BlockedMessage";

const button: Button = {
    name: "blocked-message-info",
    startsWith: true,
    requiredRoles: new Roles([]),
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: any) {
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

export = button;
