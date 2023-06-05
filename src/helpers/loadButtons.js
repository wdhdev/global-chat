try {
    const fs = require("fs");

    module.exports = async (client) => {
        const buttonFiles = fs.readdirSync(`./src/buttons/`).filter(file => file.endsWith(".js"));

        for(const file of buttonFiles) {
            const button = require(`../buttons/${file}`);

            client.buttons.set(button.name, button);

            console.log(`Loaded Button: ${button.name}`);
        }
    }
} catch(err) {
    const Sentry = require("@sentry/node");

    Sentry.captureException(err);
    console.error(err);
}