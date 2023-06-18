module.exports = async function (message, client, Discord) {
    const assignRoles = require("./roles/assign");
    const cdn = require("./cdn");
    const emoji = require("../config.json").emojis;
    const snowflake = require("discord-snowflake");
    const role = await require("./roles/get")(message.author, client);
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
            .setDescription(`${emoji.error} You are banned from using the bot!`)

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        const blocked = new Discord.EmbedBuilder()
            .setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` })
            .addFields (
                { name: "Reason", value: "Banned User" }
            )
            .setTimestamp()

        const blockedInfo = new Discord.EmbedBuilder()
            .addFields (
                { name: "User ID", value: `${message.author.id}` },
                { name: "Guild ID", value: `${message.guild.id}` }
            )

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

        blockedChannel.send({ embeds: [blocked, blockedInfo] });
        return;
    }

    if(!message.content.length && !role.verified) {
        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.error} Your media was not processed as you are not a verified user.`)

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        return;
    }

    if(message.content.length >= 2048) {
        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.error} Your message can only contain less than 2048 characters!`)

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
        .setTitle("Original Message")

    reply:
    if(reference) {
        const data = await messageSchema.findOne({ messages: reference.url });

        if(data) {
            reply = true;
        } else {
            break reply;
        }

        let user = null;

        try {
            user = await client.users.fetch(data.user);
        } catch {}

        if(user) replyEmbed.setAuthor({ name: user.tag.endsWith("#0") ? `@${user.username}` : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` });
        if(data.content) replyEmbed.setDescription(data.content);
        if(data.attachment) replyEmbed.setImage(data.attachment);
        replyEmbed.setTimestamp(snowflake(data._id));
    }

    // Embed message
    const chat = new Discord.EmbedBuilder()
        .setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` })
        .setTimestamp()

    if(message.content.length) chat.setDescription(`${message.content}`);

    await assignRoles(message, client, chat);

    // CDN
    let cdnRes = false;

    // if(message.attachments.size >= 1) cdnRes = await cdn(message, chat, client, Discord);
    if(/* cdnRes === "NSFW" || */ !cdnRes && !message.content.length) return;

    // Log
    const messagesChannel = client.channels.cache.get(client.config_channels.messages);

    const messageLog = new Discord.EmbedBuilder()
        .setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` })
        .addFields (
            { name: "Message ID", value: `${id}` },
            { name: "User ID", value: `${message.author.id}` },
            { name: "Guild ID", value: `${message.guild.id}` }
        )
        .setTimestamp()

    if(message.content.length >= 1) messageLog.setDescription(`${message.content}`);
    if(cdnRes) messageLog.setImage(chat.data.image.url);

    messagesChannel.send({ embeds: [messageLog] });

    // Send Global Message
    const messages = [];
    const promises = [];

    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async resolve => {
            await channelSchema.findOne({ _id: guildId }, async (err, data) => {
                if(data && data.channel) {
                    const chatChannel = client.channels.cache.get(data.channel);

                    if(!guild.members.me.permissions.has(requiredPerms)) return resolve(null);

                    if(!chatChannel) return resolve(null);

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
                                        await chatChannel.send({ embeds: [reply ? replyEmbed : null, chat] })
                                            .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                                    } catch {
                                        resolve(null);
                                    }
                                })

                                await webhook.send({
                                    username: webhookUsername,
                                    avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true }),
                                    content: message.content.length && !reply ? message.content : "",
                                    embeds: reply ? [replyEmbed, chat] : [],
                                    // files: cdnRes && !reply ? [chat.data.image.url] : [],
                                    allowedMentions: { parse: [] }
                                }).then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                            } catch(err) {
                                client.logEventError(err);

                                try {
                                    await chatChannel.send({ embeds: [reply ? replyEmbed : null, chat] })
                                        .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                                } catch {
                                    resolve(null);
                                }
                            }
                        } else {
                            try {
                                await chatChannel.send({ embeds: [reply ? replyEmbed : null, chat] })
                                    .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${msg.channel_id}/${msg.id}`)))
                            } catch {
                                resolve(null);
                            }
                        }
                    } catch {
                        resolve(null);
                    }
                } else {
                    resolve(null);
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
            attachment: cdnRes ? chat.data.image.url : null,
            messages: messages
        }).save()
    })
}
