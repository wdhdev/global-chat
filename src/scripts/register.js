module.exports = async (client) => {
    const { REST, Routes } = require("discord.js");
    const fs = require("fs");
    const getDirs = require("../util/getDirs");

    require("dotenv").config();

    const clientId = process.env.clientId;

    const commands = [];

    async function pushRoot() {
        const files = fs.readdirSync(`./src/commands`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${file}`);
            commands.push(command);
        }
    }

    async function pushDir(dir) {
        const files = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${dir}/${file}`);
            commands.push(command);
        }
    }

    await pushRoot();
    (await getDirs("./src/commands")).forEach(dir => pushDir(dir));

    const rest = new REST({ version: "9" }).setToken(process.env.token);

    (async () => {
        try {
            console.log("Registering slash commands...");

            const applicationCommands = await rest.put(Routes.applicationCommands(clientId), { body: commands });

            for(const command of applicationCommands) {
                client.commandIds.set(command.name, command.id);
                console.log(`Registered Command: ${command.name}`);
            }

            console.log("Registered slash commands!");
        } catch(err) {
            console.error(err);
        }
    })();
}
