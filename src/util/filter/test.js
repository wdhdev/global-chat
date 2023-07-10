module.exports = async (message, client, Discord) => {
    const links = require("./tests/links");
    const phishing = require("./tests/phishing");
    const profanity = require("./tests/profanity");

    if(!message.content.length) return false;

    // Phishing
    if(await phishing(message, client, Discord)) return true;

    // Profanity
    if(await profanity(message, client, Discord)) return true;

    // Links
    if(await links(message, client, Discord)) return true;

	return false;
}
