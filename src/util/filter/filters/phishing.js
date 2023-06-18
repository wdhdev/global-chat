module.exports = async function phishing(message) {
    const filter = require("stop-discord-phishing");

    return filter.checkMessage(message.content, true);
}
