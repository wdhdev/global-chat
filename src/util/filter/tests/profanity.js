module.exports = async function(message, client, Discord) {
    const blockedSchema = require("../../../models/blockedSchema");

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);

    const profanityFilter = require("../filters/profranity");
    const profanityResult = await profanityFilter(message);

    if(profanityResult.result) {
        new blockedSchema({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "PROFANITY",
            reason: profanityResult.words
        }).save()

        const blocked = new Discord.EmbedBuilder()
            .setTitle("⚠️ Profanity Detected")
            .setDescription("You aren't allowed to send messages with profanity!")
            .addFields (
                { name: "💬 Message", value: `${message.content}` },
                { name: "🚩 Filter", value: "🤬 Profanity" },
                { name: "❓ Reason", value: `Profanity: \`${profanityResult.words.join("\`\nProfanity: \`")}\`` }
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
            await message.author.send({ embeds: [blocked] });
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
