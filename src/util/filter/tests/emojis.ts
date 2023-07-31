import ExtendedClient from "../../../classes/ExtendedClient";
import { Message } from "discord.js";

import filter from "../filters/emojis";
import path from "path";
import warn from "../../../functions/warn";

import BlockedMessage from "../../../models/BlockedMessage";

export default async function (message: Message, client: ExtendedClient & any, Discord: any): Promise<boolean> {
    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);

    const filterResult = await filter(message);

    if(filterResult.result) {
        await new BlockedMessage({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "EMOJIS",
            reason: filterResult.matches
        }).save()

        const id = await warn(message.author.id, "[AUTOMOD] Your message includes more than 5 emojis.", client.user.id);

        const blocked = new Discord.EmbedBuilder()
            .setTitle("⛔ Message Blocked")
            .setDescription(message.content)
            .addFields (
                { name: "🚩 Filter", value: "😆 Emojis" },
                { name: "❓ Reason", value: "Your message includes more than 5 emojis." },
                { name: "⚒️ Action", value: "⚠️ Warning" }
            )

        let attachment = null;

        if(message.attachments.first()) {
            const fileExt = path.extname(message.attachments.first().url.toLowerCase());
            const allowedExtensions = ["gif", "jpeg", "jpg", "png", "svg", "webp"];

            if(allowedExtensions.includes(fileExt.split(".").join(""))) {
                attachment = new Discord.AttachmentBuilder(message.attachments.first().url, { name: `attachment${fileExt}` });

                blocked.setImage(`attachment://${attachment.name}`);
            }
        }

        let sentDM = false;

        try {
            await message.author.send({ embeds: [blocked], files: attachment ? [attachment] : [] });
            sentDM = true;
        } catch {}

        blocked.setAuthor({ name: message.author.tag.endsWith("#0") ? message.author.username : message.author.tag, iconURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${message.author.id}` });

        const actions = new Discord.ActionRowBuilder()
            .addComponents (
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId(`blocked-message-info-${message.id}`)
                    .setEmoji("ℹ️")
            )

        blockedChannel.send({ embeds: [blocked], components: [actions], files: attachment ? [attachment] : [] });

        const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

        const warnLog = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${client.user.id}` })
            .setTitle("User Warned")
            .addFields (
                { name: "📄 ID", value: `\`${id}\`` },
                { name: "👤 User", value: `${message.author}` },
                { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                { name: "❓ Reason", value: "[AUTOMOD] Your message includes more than 5 emojis." }
            )
            .setTimestamp()

        modLogsChannel.send({ embeds: [warnLog] });
        return true;
    }

    return false;
}
