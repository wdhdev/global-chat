import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction } from "discord.js";

import { createLog } from "../../util/logger";
import { noMessage } from "../../util/embeds";

import Message from "../../models/Message";

const button: Button = {
    name: "delete-message",
    startsWith: true,
    requiredRoles: ["mod"],
    async execute(interaction: ButtonInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            const id = interaction.customId.replace("delete-message-", "");
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const data = await Message.findOne({ _id: id });

            if(!data) return await interaction.reply({ embeds: [noMessage], ephemeral: true });

            const total = data.messages.length;
            let deleted = 0;

            const promises = [];

            for(const message of data.messages) {
                promises.push(new Promise(async resolve => {
                    const info = message.replace("https://discord.com/channels/", "").split("/");

                    try {
                        const channel = await client.channels.fetch(info[1]);
                        const message = await channel.messages.fetch(info[2]);

                        await message.delete();

                        deleted++;
                        resolve(true);
                    } catch(err) {
                        client.logError(err);

                        resolve(false);
                    }
                }))
            }

            Promise.all(promises).then(async () => {
                await createLog(interaction.user.id, data._id, "messageDelete", null, data.user);

                await interaction.deferUpdate();

                interaction.message.components[0].components[1].data.disabled = true;

                await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.red)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle(`🗑️ Message Deleted`)
                    .addFields (
                        { name: "📄 Result", value: `Deleted ${deleted} of ${total} messages.` }
                    )
                    .setTimestamp()

                interaction.message.embeds.push(result);

                await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle(`🗑️ Message Deleted`)
                    .addFields (
                        { name: "💬 Message", value: `${id}` },
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
            client.logButtonError(err, interaction, Discord);
        }
    }
}

export = button;
