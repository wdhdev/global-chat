const userSchema = require("../../models/userSchema");

module.exports = async function (userId, client) {
    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.guild);
        const member = await guild.members.fetch(userId);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    const data = await userSchema.findOne({ _id: userId }) || {
        dev: false,
        mod: false,
        verified: false,
        donator: false
    }

    return {
        "owner": client.config_default.owner === userId,
        "dev": data.dev,
        "mod": data.mod,
        "verified": data.verified,
        "donator": data.donator,
        "supporter": supporter
    }
}
