module.exports = async function (guild, client, Discord) {
    const channelSchema = require("../models/channelSchema");
    const filterSchema = require("../models/filterSchema");
    const noWelcomeSchema = require("../models/noWelcomeSchema");

    const checkWebhook = require("./checkWebhook");

    const requiredPerms = ["SendMessages", "EmbedLinks"];

    const msg = new Discord.EmbedBuilder()
        .setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({ format: "png", dynamic: true }) })
        .setColor(client.config_embeds.default)
        .setDescription(`**${guild.name}** has joined Global Chat!`)
        .setTimestamp()

    for(const [gId, g] of client.guilds.cache) {
        if(await noWelcomeSchema.exists({ _id: gId })) return;

        await channelSchema.findOne({ _id: gId }, async (err, data) => {
            if(data && data.channel) {
                const chatChannel = client.channels.cache.get(data.channel);

                if(!guild.members.me.permissions.has(requiredPerms)) return;
                if(!chatChannel) return await data.delete();

                if(data.webhook) {
                    if(!await checkWebhook(data.webhook)) {
                        try {
                            await chatChannel.send({ embeds: [msg] });
                        } catch {}
                        return;
                    }

                    const webhook = new Discord.WebhookClient({ url: data.webhook });

                    webhook.on("error", async () => {
                        try {
                            await chatChannel.send({ embeds: [msg] });
                        } catch {}
                    })

                    await webhook.send({ username: "Welcome", embeds: [msg] });
                } else {
                    try {
                        await chatChannel.send({ embeds: [msg] });
                    } catch {}
                }
            }
        }).clone()
    }
}