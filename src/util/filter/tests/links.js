module.exports = async function(message, client, Discord) {
    const role = await require("../../roles/get")(message.author, client);

    const blockedSchema = require("../../../models/blockedSchema");

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);

    const linkFilter = require("../filters/links");
    const linkResult = await linkFilter(message, role);

    if(linkResult.result) {
        new blockedSchema({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "LINKS",
            reason: linkResult.links
        }).save()

        const blocked = new Discord.EmbedBuilder()
            .setTitle("⚠️ Link Detected")
            .setDescription("You aren't allowed to send links!")
            .addFields (
                { name: "💬 Message", value: `${message.content}` },
                { name: "🚩 Filter", value: "📎 Links" },
                { name: "❓ Reason", value: `Link: \`${linkResult.links.join("\`\nLink: \`")}\`` }
            )

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

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        blocked.setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
        blocked.setDescription(null);

        const blockedInfo = new Discord.EmbedBuilder()
            .addFields (
                { name: "User ID", value: `${message.author.id}` },
                { name: "Guild ID", value: `${message.guild.id}` }
            )

        blockedChannel.send({ embeds: [blocked, blockedInfo] });
        return true;
    }

	return false;
}
