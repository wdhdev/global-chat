module.exports = async (message, chat, client, Discord) => {
    // const bannedUserSchema = require("../models/bannedUserSchema");
    const emoji = require("../config.json").emojis;
    const path = require("path");
    const role = await require("./roles/get")(message.author, client);
    const upload = require("./cdn/upload");

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
                { name: "Valid Extensions", value: "`jpeg`, `jpg`, `png`, `svg`, `webp`" }
            )

        try {
            await message.author.send({ embeds: [error] });
        } catch {}

        return false;
    }

    const res = await upload(process.env.token, message.attachments.first().url, message.author.id);

    if(res.status === 201) {
        chat.setImage(res.data.url);
        return true;
    }

    // if(res.status === 406 || res.data.code === "NSFW_DETECTED") {
    //     const nsfwImagesChannel = client.channels.cache.get(client.config_channels.nsfwImages);

    //     new bannedUserSchema({ _id: message.author.id }).save();

    //     const error = new Discord.EmbedBuilder()
    //         .setColor(client.config_embeds.error)
    //         .setTitle("NSFW Image Detected")
    //         .setDescription(`${emoji.information} An image you have sent has been flagged as NSFW content. As a result of this, you have been automatically banned from using the bot.\n\nIf this is a false positive, please send an appeal in the [support server](https://discord.gg/globalchat).`)
    //         .setImage(res.data.url)

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
    //         .setDescription(`${emoji.error} The server was unable to process your image.`)

    //     try {
    //         await message.author.send({ embeds: [error] });
    //     } catch {}

    //     return false;
    // }

    if(!res.status === 201 && !message.content.length) return false;
}