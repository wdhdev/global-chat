module.exports = async function cleanChannels() {
    const schema = require("../../models/filterSchema");

    let autobanData = await schema.findOne({ _id: "autoban" }) || { words: [] };
    let blacklistData = await schema.findOne({ _id: "blacklist" }) || { words: [] };

    const promises = [];

    let modifiedData = [];
    const removedData = [];

    for(const word of autobanData.words) {
        promises.push(new Promise(async resolve => {
            if(blacklistData.words.includes(word)) {
                blacklistData.words = blacklistData.words.filter(item => item !== word);

                await blacklistData.save();

                if(!modifiedData.includes("blacklist")) modifiedData.push("blacklist");

                resolve(`Modified: blacklist`);
            } else {
                resolve();
            }
        }))
    }

    await Promise.all(promises);

    if(!autobanData.words.length && autobanData._id) {
        await autobanData.delete();
        removedData.push("autoban");
    }

    if(!blacklistData.words.length && blacklistData._id) {
        await blacklistData.delete();
        removedData.push("blacklist");
    }

    return {
        "modified": modifiedData.filter(item => !removedData.includes(item)),
        "removed": removedData
    }
}
