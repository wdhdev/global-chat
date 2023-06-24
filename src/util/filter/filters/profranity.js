module.exports = async function profanity(message) {
    const filterSchema = require("../../../models/filterSchema");
    const replaceContent = require("../replaceContent");

    const blockFilter = await filterSchema.findOne({ _id: "block" }) || { words: [] };
    const autobanFilter = await filterSchema.findOne({ _id: "autoban" }) || { words: [] };

    const content = replaceContent(message.content.toLowerCase());

    const blockedWords = [];
    let autoban = false;

    blockFilter.words.some(word => {
        if(content.includes(word)) blockedWords.push(word);
    })

    autobanFilter.words.some(word => {
        if(content.includes(word)) {
            blockedWords.push(word);
            autoban = true;
        }
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
