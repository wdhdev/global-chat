module.exports = async function cleanChannels(client) {
    const promises = [];

    const schema = require("../../models/channelSchema");
    const data = await schema.find();

    const addedGuilds = [];
    const removedGuilds = [];

    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async resolve => {
        	addedGuilds.push(guildId);
            resolve();
        }))
    }

    for(const document of data) {
        promises.push(new Promise(async resolve => {
            if(addedGuilds.includes(document._id)) return resolve();

            removedGuilds.push(document._id);
            document.delete();
            resolve(document._id);
        }))
    }

    await Promise.all(promises);

    return removedGuilds;
}