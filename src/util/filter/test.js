const links = require("./tests/links");
const markdown = require("./tests/markdown");
const phishing = require("./tests/phishing");
const profanity = require("./tests/profanity");

module.exports = async function (message, client, Discord) {
    if(!message.content.length) return false;

    // Phishing
    if(await phishing(message, client, Discord)) return true;

    // Profanity
    if(await profanity(message, client, Discord)) return true;

    // Links
    if(await links(message, client, Discord)) return true;

    // Markdown
    if(await markdown(message, client, Discord)) return true;

    return false;
}
