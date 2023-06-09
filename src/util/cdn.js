module.exports = async (message, chat, client, Discord) => {
    // const bannedUserSchema = require("../models/bannedUserSchema");
    const cdn = require("@globalchat/cdn");
    const emoji = require("../config.json").emojis;
    const path = require("path");
    const role = await require("./getRoles")(message, client);

    if(!role.verified) {
        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.error} Your media was not processed as you are not a verified user.`)

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        return false;
    }

    const fileExt = path.extname(message.attachments.first().url.toLowerCase());
    const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp"];

    if(!allowedExtensions.includes(fileExt.split(".").join(""))) {
        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.error} Your media was not sent, as the file uses an invalid extension.`)
            .addFields (
                { name: "Extension Used", value: `\`${fileExt.split(".").join("")}\`` },
                { name: "Valid Extensions", value: "`jpeg`, `jpg`, `png`" }
            )

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        return false;
    }

    const res = await cdn.upload(process.env.token, message.attachments.first().url, message.author.id);

    if(res.status === 201) {
        chat.setImage(res.data.url);
        return true;
    }

    // if(res.status === 406 || res.data.code === "NSFW_DETECTED") {
    //     const nsfwImagesChannel = client.channels.cache.get(client.config_channels.nsfwImages);

    //     const data = new bannedUserSchema({ _id: message.author.id });
    //     await data.save();

    //     const error = new Discord.EmbedBuilder()
    //         .setColor(client.config_embeds.error)
    //         .setTitle("NSFW Image")
    //         .setDescription(`${emoji.information} An image you have sent has been flagged as NSFW content. As a result of this, you have been automatically banned from using the bot.\n\nIf this is a false positive, please send an appeal in the support server.`)
    //         .setImage(res.data.url)

    //     const appeal = new Discord.ActionRowBuilder()
    //         .addComponents (
    //             new Discord.ButtonBuilder()
    //                 .setStyle(Discord.ButtonStyle.Link)
    //                 .setLabel("Appeal")
    //                 .setURL("https://wdh.gg/gc-appeal")
    //         )

    //     try {
    //         await message.author.send({ embeds: [error], components: [appeal] });
    //     } catch {}

    //     error.setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
    //     error.setDescription(null);

    //     nsfwImagesChannel.send({ embeds: [error] });
    //     return "NSFW";
    // }

    // if(res.status === 422 || res.data.code === "UNABLE_TO_SCAN") {
    //     const error = new Discord.EmbedBuilder()
    //         .setColor(client.config_embeds.error)
    //         .setTitle("Image Not Sent")
    //         .setDescription(`${emoji.error} The server was unable to process your image.`)
    //         .addFields (
    //             { name: "Common Causes", value: `${emoji.dot} The file was too big\n${emoji.dot} The file was too small\n${emoji.dot} The server was unable to scan your file` }
    //         )

    //     try {
    //         await message.author.send({ embeds: [error] });
    //     } catch {}

    //     return false;
    // }

    if(!res.status === 201 && !message.content.length) return false;
}