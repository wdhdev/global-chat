module.exports = async function (message, client, Discord) {
    const assignRoles = require("./roles/assign");
    const emoji = require("../config.json").emojis;
    const role = await require("./roles/get")(message.author.id, client);
    const test = require("./filter/test");

    const bannedUserSchema = require("../models/bannedUserSchema");
    const channelSchema = require("../models/channelSchema");
    const messageSchema = require("../models/messageSchema");

    const requiredPerms = ["SendMessages", "EmbedLinks"];

    try {
        message.delete();
    } catch {}

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);

    if(await bannedUserSchema.exists({ _id: message.author.id })) {
        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.cross} You are banned from using the bot!`)

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        const blocked = new Discord.EmbedBuilder()
            .setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` })
            .setTitle("⛔ Message Blocked")
            .addFields (
                { name: "❓ Reason", value: "🔨 Banned User" }
            )
            .setTimestamp()

        if(message.content.length) blocked.setDescription(message.content);

        if(message.attachments.first()) {
            const fileExt = path.extname(message.attachments.first().url.toLowerCase());
            const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp"];

            if(allowedExtensions.includes(fileExt.split(".").join(""))) {
                const attachment = await new Discord.MessageAttachment(attachment.url).fetch();

                blocked.setImage(`attachment://${attachment.name}`);
            } else if(!message.content.length) {
                return;
            }
        }

        const info = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .addFields (
                { name: "🕰️ Timestamp", value: `<t:${Date.now().toString().slice(0, -3)}>` },
                { name: "💬 Message ID", value: `${message.id}` },
                { name: "👤 User ID", value: `${message.author.id}` },
                { name: "🗄️ Guild ID", value: `${message.guild.id}` }
            )

        blockedChannel.send({ embeds: [blocked, info] });
        return;
    }

    if(!message.content.length) {
        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.cross} Your media was not processed as the CDN is down.`)

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        return;
    }

    if(message.content.length >= 2048) {
        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.cross} Your message can only contain less than 2048 characters!`)

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        return;
    }

    if(message.content.length) {
    	if(await test(message, client, Discord)) return;
    }

    const id = message.id;

    const reference = message.type === 19 ? await message.fetchReference() : null;
    let reply = false;

    const replyEmbed = new Discord.EmbedBuilder()

    isReply:
    if(reference) {
        const data = await messageSchema.findOne({ messages: reference.url });

        if(data) {
            reply = true;
        } else {
            break isReply;
        }

        let referenceUser = null;

        try {
            referenceUser = await client.users.fetch(data.user);
        } catch {}

        if(referenceUser) replyEmbed.setAuthor({ name: referenceUser.tag.endsWith("#0") ? `@${referenceUser.username}` : referenceUser.tag, iconURL: referenceUser.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${referenceUser.id}` });;
        if(data.content) replyEmbed.setDescription(data.content);
        if(data.attachment) replyEmbed.setImage(data.attachment);
        replyEmbed.setTimestamp(new Date(Number((BigInt(data._id) >> 22n) + 1420070400000n)));
    }

    // Embed message
    const chat = new Discord.EmbedBuilder()
        .setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` })
        .setTimestamp()

    if(message.content.length) chat.setDescription(`${message.content}`);

    await assignRoles(message.author, client, chat);

    // Log
    const messagesChannel = client.channels.cache.get(client.config_channels.messages);

    const messageLog = new Discord.EmbedBuilder()
        .setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` })
        .setTimestamp()

    const actions = new Discord.ActionRowBuilder()
        .addComponents (
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`message-info-${id}`)
                .setEmoji("ℹ️"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`delete-message-${id}`)
                .setEmoji("🗑️"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`message-ban-${message.author.id}`)
                .setEmoji("🔨")
        )

    if(message.content.length >= 1) messageLog.setDescription(`${message.content}`);

    // Send Global Message
    const messages = [];
    const promises = [];

    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async resolve => {
            await channelSchema.findOne({ _id: guildId }, async (err, data) => {
                if(data && data.channel) {
                    const chatChannel = client.channels.cache.get(data.channel);

                    if(!guild.members.me.permissions.has(requiredPerms)) return resolve();

                    if(!chatChannel) return resolve();

                    try {
                        if(data.webhook) {
                            try {
                                const webhook = new Discord.WebhookClient({ url: data.webhook });

                                const username = message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag;
                                let webhookUsername = username;

                                if(role.supporter) webhookUsername = `${username} 💖`;
                                if(role.verified) webhookUsername = `${username} ✅`;
                                if(role.mod) webhookUsername = `${username} 🔨`;
                                if(role.dev) webhookUsername = `${username} 💻`;

                                webhook.on("error", async err => {
                                    client.logEventError(err);

                                    try {
                                        if(reply) {
                                            await chatChannel.send({ embeds: [replyEmbed, chat] })
                                                .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                                        } else {
                                            await chatChannel.send({ embeds: [chat] })
                                                .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                                        }
                                    } catch {
                                        resolve();
                                    }
                                })

                                if(reply) {
                                    await webhook.send({
                                        username: webhookUsername,
                                        avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true }),
                                        content: message.content,
                                        embeds: [replyEmbed],
                                        allowedMentions: { parse: [] }
                                    }).then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                                } else {
                                    await webhook.send({
                                        username: webhookUsername,
                                        avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true }),
                                        content: message.content,
                                        allowedMentions: { parse: [] }
                                    }).then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                                }
                            } catch(err) {
                                client.logEventError(err);

                                try {
                                    if(reply) {
                                        await chatChannel.send({ embeds: [replyEmbed, chat] })
                                            .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                                    } else {
                                        await chatChannel.send({ embeds: [chat] })
                                            .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                                    }
                                } catch {
                                    resolve();
                                }
                            }
                        } else {
                            try {
                                if(reply) {
                                    await chatChannel.send({ embeds: [replyEmbed, chat] })
                                        .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                                } else {
                                    await chatChannel.send({ embeds: [chat] })
                                        .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channelId}/${msg.id}`)))
                                }
                            } catch {
                                resolve();
                            }
                        }
                    } catch {
                        resolve();
                    }
                } else {
                    resolve();
                }
            }).clone()
        }))
    }

    Promise.all(promises).then(async () => {
        new messageSchema({
            _id: id,
            user: message.author.id,
            guild: message.guild.id,
            content: message.content,
            attachment: null,
            messages: messages
        }).save()

        messagesChannel.send({ embeds: [messageLog], components: [actions] });
    })
}
