module.exports = async function (message, client, Discord) {
    const cdn = require("./cdn");
    const checkWebhook = require("./checkWebhook");
    const role = await require("./roles/get")(message, client);
    const roles = require("./roles/assign");
    const test = require("./filter/test");

    const bannedUserSchema = require("../models/bannedUserSchema");
    const channelSchema = require("../models/channelSchema");
    const messageSchema = require("../models/messageSchema");

    const requiredPerms = ["SendMessages", "EmbedLinks"];

    message.delete();

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

    let content = message.content;
    // const reference = message.type === 19 ? await message.fetchReference() : null;

    // if(message.type === 19) content = `**${reference.author.username}**: ${reference.content}\n${emoji.reply} ${message.content}`;

    // Embed message
    const chat = new Discord.EmbedBuilder()
        .setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` })
        .setTimestamp()

    if(message.content.length) chat.setDescription(`${content}`);

    // CDN
    let cdnRes;

    if(message.attachments.size >= 1) cdnRes = await cdn(message, chat, client, Discord);
    if(/* cdnRes === "NSFW" || */ !cdnRes && !message.content.length) return;

    // Roles
    await roles(message, client, chat);

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

                    if(!chatChannel) {
                        await data.delete();
                        resolve(null);
                        return;
                    }

                    try {
                        if(data.webhook) {
                            if(!await checkWebhook(data.webhook)) {
                                try {
                                    await chatChannel.send({ embeds: [chat] })
                                        .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${data.channel}/${msg.id}`)))
                                } catch {
                                    resolve(null);
                                }
                                return;
                            }

                            const webhook = new Discord.WebhookClient({ url: data.webhook });

                            webhook.on("error", async () => {
                                try {
                                    await chatChannel.send({ embeds: [chat] })
                                        .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${data.channel}/${msg.id}`)))
                                } catch {
                                    resolve(null);
                                }
                            })

                            let user = message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag;

                            if(role.supporter) user = `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} 💖`;
                            if(role.verified) user = `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} ✅`;
                            if(role.mod) user = `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} 🔨`;
                            if(role.dev) user = `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} 💻`;

                            if(cdnRes) {
                                await webhook.send({
                                    username: user,
                                    avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true }),
                                    content: `${content}`,
                                    files: [chat.data.image.url],
                                    allowedMentions: { parse: [] }
                                }).then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${data.channel}/${msg.id}`)))
                                return;
                            }

                            await webhook.send({
                                username: user,
                                avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true }),
                                content: `${content}`,
                                allowedMentions: { parse: [] }
                            }).then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${data.channel}/${msg.id}`)))
                        } else {
                            try {
                                await chatChannel.send({ embeds: [chat] })
                                    .then(msg => resolve(messages.push(`https://discord.com/channels/${guildId}/${data.channel}/${msg.id}`)))
                            } catch {
                                resolve(null);
                            }
                        }
                    } catch {}
                } else {
                    resolve(null);
                }
            }).clone()
        }))
    }

    Promise.all(promises).then(async () => {
        if(cdnRes) {
            let data = new messageSchema({
                _id: id,
                user: message.author.id,
                guild: message.guild.id,
                content: message.content,
                attachment: chat.data.image.url,
                messages: messages
            })

            await data.save();
        } else {
            let data = new messageSchema({
                _id: id,
                timestamp: Date.now(),
                user: message.author.id,
                guild: message.guild.id,
                content: message.content,
                attachment: null,
                messages: messages
            })

            await data.save();
        }
    })
}