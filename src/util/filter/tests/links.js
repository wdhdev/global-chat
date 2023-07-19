const BlockedMessage = require("../../../models/BlockedMessage");

module.exports = async function (message, client, Discord) {
    const role = await require("../../roles/get")(message.author.id, client);

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);

    const filter = require("../filters/links");
    const filterResult = await filter(message, role);

    if(filterResult.result) {
        new BlockedMessage({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "LINKS",
            reason: filterResult.matches
        }).save()

        const blocked = new Discord.EmbedBuilder()
            .setTitle("⛔ Message Blocked")
            .setDescription(message.content)
            .addFields (
                { name: "🚩 Filter", value: "🔗 Links" },
                { name: "❓ Reason", value: `- \`${filterResult.matches.join("\`\n- \`")}\`` }
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

        try {
            await message.author.send({ embeds: [blocked], files: attachment ? [attachment] : [] });
        } catch {}

        blocked.setAuthor({ name: message.author.tag.endsWith("#0") ? message.author.username : message.author.tag, iconURL: message.author.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${message.author.id}` });

        const actions = new Discord.ActionRowBuilder()
            .addComponents (
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId(`blocked-message-info-${message.id}`)
                    .setEmoji("ℹ️"),

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId(`blocked-message-ban-${message.author.id}`)
                    .setEmoji("🔨")
            )

        blockedChannel.send({ embeds: [blocked], components: [actions], files: attachment ? [attachment] : [] });
        return true;
    }

    return false;
}
