module.exports = async function profanity(message) {
    const filterSchema = require("../../../models/filterSchema");
    const replaceContent = require("../replaceContent");

    const filter = await filterSchema.findOne({ _id: "block" });

    const content = replaceContent(message.content.toLowerCase());

    const blockedWords = [];

    filter.words.some(word => {
        if(content.includes(word)) blockedWords.push(word);
    })

    if(blockedWords.length) {
        return {
            "result": true,
            "words": blockedWords
        }
    } else {
        return {
            "result": false
        }
    }
}
