module.exports = async function cleanChannels(client) {
    const guildSchema = require("../../models/guildSchema");
    const checkWebhook = require("../checkWebhook");

    const data = await guildSchema.find();

    const promises = [];

    const validGuilds = [];
    let modifiedData = [];
    const removedData = [];

    // Valid Guilds
    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async resolve => {
        	validGuilds.push(guildId);
            resolve();
        }))
    }

    // Remove Invalid Guilds
    for(const document of data) {
        promises.push(new Promise(async resolve => {
            if(validGuilds.includes(document._id)) return resolve();

            await guildSchema.findOneAndDelete({ _id: document._id });

            removedData.push(document._id);
            resolve(`Deleted: ${document._id}`);
        }))
    }

    // Check Webhooks
    for(const document of data) {
        promises.push(new Promise(async resolve => {
            if(document.webhook) {
                if(!(await checkWebhook(document.webhook))) {
                    await guildSchema.findOneAndUpdate({ _id: document._id }, { webhook: null });

                    modifiedData.push(document._id);
                    resolve(`Modified: ${document._id}`);
                    return;
                }

                resolve();
                return;
            }

            resolve();
        }))
    }

    await Promise.all(promises);

    return {
        "modified": modifiedData.filter(item => !removedData.includes(item)),
        "removed": removedData
    }
}
