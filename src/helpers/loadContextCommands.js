const fs = require("fs");
const getDirs = require("../util/getDirs");

module.exports = async (client) => {
    async function loadRoot() {
        const files = fs.readdirSync(`./src/context-menu`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${file}`);

            client.contextCommands.set(command.name, command);

            console.log(`Loaded Context Command: ${command.name}`);
        }
    }

    async function loadDir(dir) {
        const files = fs.readdirSync(`./src/context-menu/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${dir}/${file}`);

            client.contextCommands.set(command.name, command);

            console.log(`Loaded Context Command: ${command.name}`);
        }
    }

    await loadRoot();
    (await getDirs("./src/context-menu")).forEach(dir => loadDir(dir));
}
