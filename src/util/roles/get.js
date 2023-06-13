module.exports.interaction = async function (interaction, client) {
    const get = require("@globalchat/get");

    const user = await get.user(interaction.user.id);
    const role = user.roles;

    const owner = client.config_default.owner === interaction.user.id;

    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.server);
        const member = await guild.members.fetch(interaction.user);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    return {
        "owner": owner,
        "dev": role.dev,
        "mod": role.mod,
        "verified": role.verified,
        "supporter": supporter
    }
}

module.exports.message = async function (message, client) {
    const get = require("@globalchat/get");

    const user = await get.user(message.author.id);
    const role = user.roles;

    const owner = client.config_default.owner === message.author.id;

    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.server);
        const member = await guild.members.fetch(message.author);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    return {
        "owner": owner,
        "dev": role.dev,
        "mod": role.mod,
        "verified": role.verified,
        "supporter": supporter
    }
}
