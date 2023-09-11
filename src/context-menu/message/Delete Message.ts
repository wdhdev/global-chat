import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import { MessageContextMenuCommandInteraction } from "discord.js";

import { createLog } from "../../util/logger";
import { emojis as emoji } from "../../config";
import { noMessage, noPermissionCommand } from "../../util/embeds";

import Message from "../../models/Message";
import User from "../../models/User";

const command: ContextCommand = {
    name: "Delete Message",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: MessageContextMenuCommandInteraction, client: ExtendedClient & any, Discord: any) {
        try {
            const message = interaction.targetMessage;
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const data = await Message.findOne({ messages: message.url });
            const userData = await User.findOne({ _id: interaction.user.id });

            if(!data) return await interaction.editReply({ embeds: [noMessage] });

            if(!userData?.mod && !userData?.dev && data.user !== interaction.user.id) return await interaction.editReply({ embeds: [noPermissionCommand] });

            const total = data.messages.length;
            let deleted = 0;

            const promises = [];

            for(const message of data.messages) {
                promises.push(new Promise(async (resolve: any) => {
                    const info = message.replace("https://discord.com/channels/", "").split("/");

                    try {
                        const channel: any = await client.channels.fetch(info[1]);
                        const message = await channel.messages.fetch(info[2]);

                        await message.delete();

                        deleted++;
                        resolve(true);
                    } catch {
                        resolve(false);
                    }
                }))
            }

            Promise.all(promises).then(async () => {
                await createLog(interaction.user.id, data._id, "messageDelete", null, data.user);

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} The message has been deleted!`)

                await interaction.editReply({ embeds: [result] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle(`🗑️ Message Deleted`)
                    .addFields (
                        { name: "💬 Message", value: `${data._id}` },
                        { name: "📄 Result", value: `Deleted ${deleted} of ${total} messages.` }
                    )
                    .setTimestamp()

                let user = null;

                try {
                    user = await client.users.fetch(data.user);
                } catch {}

                const message = new Discord.EmbedBuilder()
                    .setTimestamp(new Date(Number((BigInt(data._id) >> 22n) + 1420070400000n)))

                if(user) message.setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
                if(data.content) message.setDescription(data.content);

                modLogsChannel.send({ embeds: [log, message] });
            })
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

export = command;
