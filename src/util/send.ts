import ExtendedClient from "../classes/ExtendedClient";
import { CommandInteraction, Message as MessageType, PermissionResolvable } from "discord.js";

import assignRoles from "../functions/roles/assign";
import cap from "./cap";
import easterEggs from "./features/easter-eggs";
import getRoles from "../functions/roles/get";
import levelRoles from "../functions/roles/levelRoles";
import path from "path";
import test from "./filter/test";

import BannedUser from "../models/BannedUser";
import Guild from "../models/Guild";
import Message from "../models/Message";

const requiredPerms: PermissionResolvable = ["SendMessages", "EmbedLinks"];

export default async (message: MessageType, client: ExtendedClient & any, Discord: any) => {
    const role = await getRoles(message.author.id, client);

    try {
        message.delete();
    } catch {}

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);

    if(await BannedUser.exists({ _id: message.author.id })) return;
    if(!message.content.length) return;

    if(message.content.length > 2000) {
        const blocked = new Discord.EmbedBuilder()
            .setAuthor({ name: message.author.tag.endsWith("#0") ? message.author.username : message.author.tag, iconURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${message.author.id}` })
            .setTitle("⛔ Message Blocked")
            .setDescription(cap(message.content, 2000))
            .addFields (
                { name: "❓ Reason", value: "Message is too long." }
            )
            .setTimestamp()

        let attachment = null;

        if(message.attachments.first()) {
            const fileExt = path.extname(message.attachments.first().url.toLowerCase());
            const allowedExtensions = ["gif", "jpeg", "jpg", "png", "svg", "webp"];

            if(allowedExtensions.includes(fileExt.split(".").join(""))) {
                attachment = new Discord.AttachmentBuilder(message.attachments.first().url, { name: `attachment${fileExt}` });

                blocked.setImage(`attachment://${attachment.name}`);
            }
        }

        try {
            await message.author.send({ embeds: [blocked], files: attachment ? [attachment] : [] });
        } catch {}

        blocked.setAuthor({ name: message.author.tag.endsWith("#0") ? message.author.username : message.author.tag, iconURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${message.author.id}` });

        const info = new Discord.EmbedBuilder()
            .addFields (
                { name: "🕰️ Timestamp", value: `<t:${Date.now().toString().slice(0, -3)}> (<t:${Date.now().toString().slice(0, -3)}:R>)` },
                { name: "💬 Message ID", value: `${message.id}` },
                { name: "👤 User ID", value: `${message.author.id}` },
                { name: "🗄️ Guild ID", value: `${message.guild.id}` }
            )

        blockedChannel.send({ embeds: [blocked, info], files: attachment ? [attachment] : [] });
        return;
    }

    if(await test(message, client, Discord)) return;

    const content: any = await easterEggs(message.content);

    const reference = message.type === 19 ? await message.fetchReference() : null;
    let reply = false;

    const replyEmbed = new Discord.EmbedBuilder()
        .setTitle("Reference Message")

    isReply:
    if(reference) {
        const data = await Message.findOne({ messages: reference.url });

        if(data) {
            reply = true;
        } else {
            break isReply;
        }

        let referenceUser = null;

        try {
            referenceUser = await client.users.fetch(data.user);
        } catch {}

        if(referenceUser) replyEmbed.setAuthor({ name: referenceUser.tag.endsWith("#0") ? referenceUser.username : referenceUser.tag, iconURL: referenceUser.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${referenceUser.id}` });;
        if(data.content) replyEmbed.setDescription(data.content);
        replyEmbed.setTimestamp(new Date(Number((BigInt(data._id) >> 22n) + 1420070400000n)));
    }

    // Embed message
    const chat = new Discord.EmbedBuilder()
        .setAuthor({ name: message.author.tag.endsWith("#0") ? message.author.username : message.author.tag, iconURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${message.author.id}` })
        .setTimestamp()

    if(content.length) chat.setDescription(content);

    await assignRoles(message.author, client, chat);

    // Log
    const messagesChannel = client.channels.cache.get(client.config_channels.messages);

    const messageLog = new Discord.EmbedBuilder()
        .setAuthor({ name: message.author.tag.endsWith("#0") ? message.author.username : message.author.tag, iconURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${message.author.id}` })
        .setTimestamp()

    const actions = new Discord.ActionRowBuilder()
        .addComponents (
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`message-info-${message.id}`)
                .setEmoji("ℹ️"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`delete-message-${message.id}`)
                .setEmoji("🗑️"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`message-ban-${message.author.id}`)
                .setEmoji("🔨")
        )

    if(content.length >= 1) messageLog.setDescription(content);

    // Send Global Message
    const messages: string[] = [];
    const promises = [];

    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async (resolve: any) => {
            if(!guild.members.me.permissions.has(requiredPerms)) return resolve();

            const data = await Guild.findOne({ _id: guildId });

            if(!data) return resolve();

            if(!data.blockedUsers.includes(message.author.id) || guildId === message.guild.id) {
                const chatChannel = client.channels.cache.get(data.channel);
                if(!chatChannel) return resolve();

                if(reply) {
                    replyEmbed.setURL(null);

                    for(const url of (await Message.findOne({ messages: reference.url })).messages) {
                        const info = url.replace("https://discord.com/channels/", "").split("/");

                        if(info[0] === guildId) replyEmbed.setURL(url);
                    }
                }

                if(data.webhook) {
                    try {
                        const webhook = new Discord.WebhookClient({ url: data.webhook });

                        const username = message.author.tag.endsWith("#0") ? message.author.username : message.author.tag;
                        let webhookUsername = username;

                        if(role.supporter) webhookUsername = `${username} 💖`;
                        if(role.verified) webhookUsername = `${username} ✅`;
                        if(role.donator) webhookUsername = `${username} 💸`;
                        if(role.mod) webhookUsername = `${username} 🔨`;
                        if(role.dev) webhookUsername = `${username} 💻`;

                        if(reply) {
                            await webhook.send({
                                username: webhookUsername,
                                avatarURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }),
                                content: content,
                                embeds: [replyEmbed],
                                allowedMentions: { parse: [] }
                            }).then((msg: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                        } else {
                            await webhook.send({
                                username: webhookUsername,
                                avatarURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }),
                                content: content,
                                allowedMentions: { parse: [] }
                            }).then((msg: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                        }
                    } catch(err) {
                        try {
                            if(reply) {
                                await chatChannel.send({ embeds: [replyEmbed, chat] })
                                    .then((msg: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                            } else {
                                await chatChannel.send({ embeds: [chat] })
                                    .then((msg: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                            }
                        } catch {
                            resolve();
                        }
                    }
                } else {
                    try {
                        if(reply) {
                            await chatChannel.send({ embeds: [replyEmbed, chat] })
                                .then((msg: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                        } else {
                            await chatChannel.send({ embeds: [chat] })
                                .then((msg: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                        }
                    } catch {
                        resolve();
                    }
                }
            } else {
                resolve();
            }
        }))
    }

    Promise.all(promises).then(async () => {
        new Message({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            content: content,
            messages: messages
        }).save()

        messagesChannel.send({ embeds: [messageLog], components: [actions] });
    })

    await levelRoles(message.author, client, Discord);
}

export async function announce(text: String, interaction: CommandInteraction, client: ExtendedClient & any, Discord: any) {
    const msg = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
        .setTitle("Announcement")
        .setDescription(text)
        .setTimestamp()

    // Log
    const messagesChannel = client.channels.cache.get(client.config_channels.messages);

    const messageLog = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
        .setTitle("Announcement")
        .setDescription(text)
        .setTimestamp()

    const actions = new Discord.ActionRowBuilder()
        .addComponents (
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`message-info-${interaction.id}`)
                .setEmoji("ℹ️"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`delete-message-${interaction.id}`)
                .setEmoji("🗑️")
        )

    // Send Global Message
    const messages: string[] = [];
    const promises = [];

    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async (resolve: any) => {
            if(!guild.members.me.permissions.has(requiredPerms)) return resolve();

            const data = await Guild.findOne({ _id: guildId });

            if(!data) return resolve();

            const chatChannel = client.channels.cache.get(data.channel);
            if(!chatChannel) return resolve();

            if(data.webhook) {
                try {
                    const webhook = new Discord.WebhookClient({ url: data.webhook });

                    await webhook.send({
                        username: "Announcements",
                        avatar: "https://avatars.githubusercontent.com/u/126386097",
                        embeds: [msg]
                    }).then((message: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${message.channel_id}/${message.id}`)))
                } catch(err) {
                    console.error(err)
                    try {
                        await chatChannel.send({ embeds: [msg] })
                            .then((message: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${message.channelId}/${message.id}`)))
                    } catch {
                        resolve();
                    }
                }
            } else {
                try {
                    await chatChannel.send({ embeds: [msg] })
                        .then((message: MessageType & any) => resolve(messages.push(`https://discord.com/channels/${guildId}/${message.channelId}/${message.id}`)))
                } catch {
                    resolve();
                }
            }
        }))
    }

    Promise.all(promises).then(async () => {
        new Message({
            _id: interaction.id,
            user: interaction.user.id,
            guild: interaction.guild.id,
            content: text,
            messages: messages
        }).save()

        messagesChannel.send({ embeds: [messageLog], components: [actions] });
    })
}
