const devSchema = require("../../models/devSchema");
const modSchema = require("../../models/modSchema");
const verifiedSchema = require("../../models/verifiedSchema");

module.exports = async function (userId, client) {
    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.guild);
        const member = await guild.members.fetch(userId);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    return {
        "owner": client.config_default.owner === userId,
        "dev": await devSchema.exists({ _id: userId }) ? true : false,
        "mod": await modSchema.exists({ _id: userId }) ? true : false,
        "verified": await verifiedSchema.exists({ _id: userId }) ? true : false,
        "supporter": supporter
    }
}
