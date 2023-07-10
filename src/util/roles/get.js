const User = require("../../models/User");

module.exports = async function (userId, client) {
    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_default.guild);
        const member = await guild.members.fetch(userId);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    const data = await User.findOne({ _id: userId });

    return {
        "owner": client.config_default.owner === userId,
        "dev": data?.dev ? data.dev : false,
        "mod": data?.mod ? data.mod : false,
        "verified": data?.verified ? data.verified : false,
        "donator": data?.donator ? data.donator : false,
        "supporter": supporter
    }
}
