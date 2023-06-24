module.exports = async function profanity(message) {
    const filterSchema = require("../../../models/filterSchema");
    const replaceContent = require("../replaceContent");

    const autobanFilter = await filterSchema.findOne({ _id: "autoban" }) || { words: [] };
    const blockFilter = await filterSchema.findOne({ _id: "block" }) || { words: [] };

    const content = replaceContent(message.content.toLowerCase());

    const blockedWords = [];
    let autoban = false;

    autobanFilter.words.some(word => {
        if(content.includes(word)) {
            blockedWords.push(word);
            autoban = true;
        }
    })

    blockFilter.words.some(word => {
        if(content.includes(word)) blockedWords.push(word);
    })

    if(blockedWords.length) {
        return {
            "result": true,
            "words": blockedWords,
            "autoban": autoban
        }
    } else {
        return {
            "result": false
        }
    }
}
