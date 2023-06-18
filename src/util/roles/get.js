const devSchema = require("../../models/devSchema");
const modSchema = require("../../models/modSchema");
const verifiedSchema = require("../../models/verifiedSchema");

module.exports = async function (user, client) {
    const role = await getRoles(user.id, client);

    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.guild);
        const member = await guild.members.fetch(user);

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
