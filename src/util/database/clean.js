module.exports = async function (client, Discord) {
    const logsChannel = client.guilds.cache.get(client.config_channels.logs);

    // Banned Users
    const cleanBannedUsers = require("./cleanBannedUsers");
    const bannedUsersRes = await cleanBannedUsers(client);

    const bannedUsersResult = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
        .setTitle("🧹 Collection Cleanup")
        .setDescription("`banned-users`")
        .addFields (
            { name: "🗑️ Removed Documents", value: bannedUsersRes.removed.length ? `\`\`\`${bannedUsersRes.removed.join("\n")}\`\`\`` : "*None*" }
        )
        .setTimestamp()

    if(bannedUsersRes.removed.length) logsChannel.send({ embeds: [bannedUsersResult] });

    // Filter
    const cleanFilter = require("./cleanFilter");
    const filterRes = await cleanFilter();

    const filterResult = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
        .setTitle("🧹 Collection Cleanup")
        .setDescription("`filter`")
        .addFields (
            { name: "📝 Modified Documents", value: filterRes.modified.length ? `\`\`\`${filterRes.modified.join("\n")}\`\`\`` : "*None*" },
            { name: "🗑️ Removed Documents", value: filterRes.removed.length ? `\`\`\`${filterRes.removed.join("\n")}\`\`\`` : "*None*" }
        )
        .setTimestamp()

    if(filterRes.modified.length || filterRes.removed.length) logsChannel.send({ embeds: [filterResult] });

    // Guilds
    const cleanGuilds = require("./cleanGuilds");
    const guildsRes = await cleanGuilds(client);

    const guildsResult = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
        .setTitle("🧹 Collection Cleanup")
        .setDescription("`guilds`")
        .addFields (
            { name: "📝 Modified Documents", value: guildsRes.modified.length ? `\`\`\`${guildsRes.modified.join("\n")}\`\`\`` : "*None*" },
            { name: "🗑️ Removed Documents", value: guildsRes.removed.length ? `\`\`\`${guildsRes.removed.join("\n")}\`\`\`` : "*None*" }
        )
        .setTimestamp()

    if(guildsRes.modified.length || guildsRes.removed.length) logsChannel.send({ embeds: [guildsResult] });
}
