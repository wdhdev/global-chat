module.exports = async function (message, client) {
    const get = require("@globalchat/get");

    const user = await get.user(message.author.id);
    const role = user.roles;

    const guild = await client.guilds.fetch(client.config_default.server);
    const member = await guild.members.fetch(message.author) || null;

    const owner = client.config_default.owner === message.author.id;
    const supporter = member.premiumSinceTimestamp ? true : false;

    return {
        "owner": owner,
        "dev": role.dev,
        "mod": role.mod,
        "verified": role.verified,
        "supporter": supporter
    }
}

module.exports.interaction = async function (interaction, client) {
    const get = require("@globalchat/get");

    const user = await get.user(interaction.user.id);
    const role = user.roles;

    const guild = await client.guilds.fetch(client.config_default.server);
    const member = await guild.members.fetch(interaction.user) || null;

    const owner = client.config_default.owner === interaction.user.id;
    const supporter = member.premiumSinceTimestamp ? true : false;

    return {
        "owner": owner,
        "dev": role.dev,
        "mod": role.mod,
        "verified": role.verified,
        "supporter": supporter
    }
}
