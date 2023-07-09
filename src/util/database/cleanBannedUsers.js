module.exports = async function cleanChannels(client) {
    const bannedUserSchema = require("../../models/bannedUserSchema");

    const data = await bannedUserSchema.find();

    const promises = [];

    const removedData = [];

    // Remove Invalid Users
    for(const document of data) {
        promises.push(new Promise(async resolve => {
            try {
                await client.users.fetch(document._id);
                resolve();
            } catch {
                await bannedUserSchema.findOneAndDelete({ _id: document._id });

                removedData.push(document._id);
                resolve(`Deleted: ${document._id}`);
            }
        }))
    }

    await Promise.all(promises);

    return {
        "removed": removedData
    }
}
