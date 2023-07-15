const Filter = require("../../../models/Filter");

module.exports = async function (message) {
    const replaceContent = require("../replaceContent");

    const autobanFilter = await Filter.findOne({ _id: "autoban" }) || { words: [] };
    const blacklistFilter = await Filter.findOne({ _id: "blacklist" }) || { words: [] };

    const content = replaceContent(message.content.toLowerCase());

    const matches = [];

    let autoban = false;
    let blacklist = false;

    autobanFilter.words.some(word => {
        if(content.includes(word)) {
            matches.push(word);
            autoban = true;
        }
    })

    blacklistFilter.words.some(word => {
        if(content.includes(word)) {
            matches.push(word);
            blacklist = true;
        }
    })

    if(matches.length) {
        return {
            "result": true,
            "matches": matches,
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
