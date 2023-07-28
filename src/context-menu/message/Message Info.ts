import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import { MessageContextMenuCommandInteraction } from "discord.js";

import { noMessage } from "../../util/embeds";

import Message from "../../models/Message";

const command: ContextCommand = {
    name: "Message Info",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: MessageContextMenuCommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const message = interaction.targetMessage;

            const data = await Message.findOne({ messages: message.url });

            if(!await Message.exists({ messages: message.url })) return await interaction.editReply({ embeds: [noMessage] });

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "🕰️ Timestamp", value: `<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}> (<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}:R>)` },
                    { name: "💬 Message ID", value: `${data._id}` },
                    { name: "👤 User ID", value: `${data.user}` },
                    { name: "🗄️ Guild ID", value: `${data.guild}` },
                    { name: "📤 Sent To", value: `${data.messages.length} guild${data.messages.length === 1 ? "" : "s"}` }
                )

            await interaction.editReply({ embeds: [info] });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

export = command;
