module.exports = async function phishing(message) {
    const filter = require("stop-discord-phishing");

    const result = await filter.checkMessage(message.content, true)

    return result;
}
