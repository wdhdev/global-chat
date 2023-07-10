const Guild = require("../models/Guild");
const Message = require("../models/Message");

const requiredPerms = ["SendMessages", "EmbedLinks"];

module.exports = async function (text, interaction, client, Discord) {
    const msg = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
        .setTitle("Announcement")
        .setDescription(text)
        .setTimestamp()

    // Log
    const messagesChannel = client.channels.cache.get(client.config_channels.messages);

    const messageLog = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
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
                .setEmoji("🗑️"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`message-ban-${interaction.user.id}`)
                .setEmoji("🔨")
        )

    // Send Global Message
    const messages = [];
    const promises = [];

    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async resolve => {
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
                    }).then(message => resolve(messages.push(`https://discord.com/channels/${guildId}/${message.channel_id}/${message.id}`)))
                } catch(err) {
                    console.error(err)
                    try {
                        await chatChannel.send({ embeds: [msg] })
                            .then(message => resolve(messages.push(`https://discord.com/channels/${guildId}/${message.channelId}/${message.id}`)))
                    } catch {
                        resolve();
                    }
                }
            } else {
                try {
                    await chatChannel.send({ embeds: [msg] })
                        .then(message => resolve(messages.push(`https://discord.com/channels/${guildId}/${message.channelId}/${message.id}`)))
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
