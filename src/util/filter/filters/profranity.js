module.exports = async function profanity(message) {
    const Filter = require("../../../models/Filter");
    const replaceContent = require("../replaceContent");

    const autobanFilter = await Filter.findOne({ _id: "autoban" }) || { words: [] };
    const blacklistFilter = await Filter.findOne({ _id: "blacklist" }) || { words: [] };

    const content = replaceContent(message.content.toLowerCase());

    const blockedWords = [];

    let autoban = false;
    let blacklist = false;

    autobanFilter.words.some(word => {
        if(content.includes(word)) {
            blockedWords.push(word);
            autoban = true;
        }
    })

    blacklistFilter.words.some(word => {
        if(content.includes(word)) {
            blockedWords.push(word);
            blacklist = true;
        }
    })

    if(blockedWords.length) {
        return {
            "result": true,
            "words": blockedWords,
            "filter": {
                "autoban": autoban,
                "blacklist": blacklist
            }
        }
    } else {
        return {
            "result": false
        }
    }
}
