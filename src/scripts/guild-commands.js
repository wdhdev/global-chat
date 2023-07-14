const { REST, Routes } = require("discord.js");

const fs = require("fs");
const getDirs = require("../util/getDirs");

require("dotenv").config();

module.exports = async function (client) {
    const commands = [];

    const rest = new REST({ version: "9" }).setToken(process.env.token);

    // Push Slash Commands
    await pushCommandsRoot();
    (await getDirs("./src/commands")).forEach(dir => pushCommandsDir(dir));

    // Push Context Menu Commands
    await pushContextMenuRoot();
    (await getDirs("./src/context-menu")).forEach(dir => pushContextMenuDir(dir));

    (async () => {
        try {
            console.log("Registering guild commands...");

            for(const guild of client.config_default.hasGuildOnlyCommands) {
                try {
                    await rest.put(Routes.applicationGuildCommands(process.env.clientId, guild), { body: commands });
                } catch(err) {
                    console.log(`Failed to register guild commands to ${guild}!`);
                    continue;
                }

                console.log(`Registered guild commands to ${guild}!`);
            }

            console.log("Registered guild commands!");
        } catch(err) {
            client.sentry.captureException(err);
            console.error(err);

            console.error("Failed to register guild commands!");
        }
    })()

    // Slash Commands
    async function pushCommandsRoot() {
        const files = fs.readdirSync(`./src/commands`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }

    async function pushCommandsDir(dir) {
        const files = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${dir}/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }

    // Context Menu Commands
    async function pushContextMenuRoot() {
        const files = fs.readdirSync(`./src/context-menu`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }

    async function pushContextMenuDir(dir) {
        const files = fs.readdirSync(`./src/context-menu/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${dir}/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }
}
