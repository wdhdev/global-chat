const filter = require("stop-discord-phishing");

module.exports = async function (message) {
    return filter.checkMessage(message.content, true);
}
