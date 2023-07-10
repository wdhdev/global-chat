const fs = require("fs");
const getDirs = require("../util/getDirs");

module.exports = async (client, Discord) => {
    async function loadDir(dir) {
        const files = fs.readdirSync(`./src/events/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const event = require(`../events/${dir}/${file}`);

            client.events.set(event.name, event);

            console.log(`Loaded Event: ${event.name}`);

            if(event.once) {
                client.once(event.name, (message, interaction) => event.execute(client, Discord, message, interaction));
            } else {
                client.on(event.name, (message, interaction) => event.execute(client, Discord, message, interaction));
            }
        }
    }

    (await getDirs("./src/events")).forEach(dir => loadDir(dir));

    client.logError = async function (err) {
        client.sentry.captureException(err);
    }

    client.logEventError = async function (err) {
        client.sentry.captureException(err);
    }

    require("dotenv").config();
}