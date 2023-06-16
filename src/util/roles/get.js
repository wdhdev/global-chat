const devSchema = require("../../models/devSchema");
const modSchema = require("../../models/modSchema");
const verifiedSchema = require("../../models/verifiedSchema");

module.exports.interaction = async function (interaction, client) {
    const role = await getRoles(interaction.user.id, client);

    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.server);
        const member = await guild.members.fetch(interaction.user);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    return {
        "owner": role.owner,
        "dev": role.dev,
        "mod": role.mod,
        "verified": role.verified,
        "supporter": supporter
    }
}

module.exports.message = async function (message, client) {
    const role = await getRoles(message.author.id, client);

    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.server);
        const member = await guild.members.fetch(message.author);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    return {
        "owner": role.owner,
        "dev": role.dev,
        "mod": role.mod,
        "verified": role.verified,
        "supporter": supporter
    }
}

async function getRoles(user, client) {
    return {
        "owner": client.config_default.owner === user,
        "dev": await devSchema.exists({ _id: user }) ? true : false,
        "mod": await modSchema.exists({ _id: user }) ? true : false,
        "verified": await verifiedSchema.exists({ _id: user }) ? true : false
    }
}
