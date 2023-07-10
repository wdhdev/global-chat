module.exports = async function (client) {
    const { REST, Routes } = require("discord.js");
    const fs = require("fs");
    const getDirs = require("../getDirs");

    require("dotenv").config();

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
            console.log("Registering commands...");

            const applicationCommands = await rest.put(Routes.applicationCommands(process.env.clientId), { body: commands });

            for(const command of applicationCommands) {
                client.commandIds.set(command.name, command.id);
                console.log(`Registered Command: ${command.name}`);
            }

            console.log("Registered commands!");
        } catch(err) {
            client.sentry.captureException(err);
            console.error("Failed to register commands!");
        }
    })()

    // Slash Commands
    async function pushCommandsRoot() {
        const files = fs.readdirSync(`./src/commands`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../../commands/${file}`);
            commands.push(command);
        }
    }

    async function pushCommandsDir(dir) {
        const files = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../../commands/${dir}/${file}`);
            commands.push(command);
        }
    }

    // Context Menu Commands
    async function pushContextMenuRoot() {
        const files = fs.readdirSync(`./src/context-menu`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../../context-menu/${file}`);
            commands.push(command);
        }
    }

    async function pushContextMenuDir(dir) {
        const files = fs.readdirSync(`./src/context-menu/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../../context-menu/${dir}/${file}`);
            commands.push(command);
        }
    }
}
