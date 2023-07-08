module.exports = async function (text, interaction, client, Discord) {
    const channelSchema = require("../models/channelSchema");
    const checkWebhook = require("./checkWebhook");

    const requiredPerms = ["SendMessages", "EmbedLinks"];

    const msg = new Discord.EmbedBuilder()
        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
        .setTitle("Announcement")
        .setDescription(`${text}`)
        .setTimestamp()

    const infoButton = new Discord.ActionRowBuilder()
        .addComponents (
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId("announcement")
                .setEmoji("ℹ️")
        )

    for(const [guildId, guild] of client.guilds.cache) {
        await channelSchema.findOne({ _id: guildId }, async (err, data) => {
            if(data && data.channel) {
                const chatChannel = client.channels.cache.get(data.channel);

                if(!guild.members.me.permissions.has(requiredPerms)) return;
                if(!chatChannel) return;

                if(data.webhook) {
                    if(!await checkWebhook(data.webhook)) {
                        try {
                            await chatChannel.send({ embeds: [msg], components: [infoButton] });
                        } catch {}
                        return;
                    }

                    const webhook = new Discord.WebhookClient({ url: data.webhook });

                    webhook.on("error", async () => {
                        try {
                            await chatChannel.send({ embeds: [msg], components: [infoButton] });
                        } catch {}
                    })

                    await webhook.send({ username: "Announcements", embeds: [msg], components: [infoButton] });
                } else {
                    try {
                        await chatChannel.send({ embeds: [msg], components: [infoButton] });
                    } catch {}
                }
            }
        }).clone()
    }
}
