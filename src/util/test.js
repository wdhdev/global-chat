module.exports = async (message, client, Discord) => {
    const blockedSchema = require("../models/blockedSchema");
    const filterSchema = require("../models/filterSchema");
    const replaceContent = require("./replaceContent");
    const role = await require("./getRoles")(message, client);

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);

    // Profanity filter
    const filter = await filterSchema.findOne({ _id: "block" });

    const content = replaceContent(message.content.toLowerCase());

    const blockedWords = [];

    filter.words.some(word => {
        if(content.includes(word)) {
            blockedWords.push(word);
        }
    })

    if(blockedWords.length) {
        data = new blockedSchema({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "PROFANITY",
            reason: blockedWords
        })

        await data.save();

        const blocked = new Discord.EmbedBuilder()
            .setTitle("Blocked Phrase")
            .setDescription("You aren't allowed to send messages with blocked phrases!")
            .addFields (
                { name: "Message", value: `${message.content}` },
                { name: "Reason", value: `Detected Word: \`${blockedWords.join("\`\nDetected Word: \`")}\`` }
            )

        try {
            await message.author.send({ embeds: [blocked] });
        } catch {}

        blocked.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });

        const blockedInfo = new Discord.EmbedBuilder()
            .addFields (
                { name: "User ID", value: `${message.author.id}` },
                { name: "Guild ID", value: `${message.guild.id}` }
            )

        blockedChannel.send({ embeds: [blocked, blockedInfo] });
        return true;
    }

    // Link filter
    const urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

    const linkMatches = message.content.match(urlRegex) || [];

    if(message.content.match(urlRegex) && !role.verified) {
        data = new blockedSchema({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "LINK",
            reason: linkMatches
        })

        await data.save();

        const blocked = new Discord.EmbedBuilder()
        	.setTitle("Blocked Link")
            .setDescription("You aren't allowed to send links!")
            .addFields (
                { name: "Message", value: `${message.content}` },
                { name: "Reason", value: `Detected Link: \`${linkMatches.join("\`\nDetected Link: \`")}\`` }
            )

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        blocked.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });

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