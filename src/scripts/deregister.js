const { REST, Routes } = require("discord.js");

require("dotenv").config();

const rest = new REST({ version: "9" }).setToken(process.env.token);

try {
    console.log("Deregistering commands...");

    rest.put(Routes.applicationCommands(process.env.clientId), { body: [] });

    console.log("Deregistered commands!");
} catch(err) {
    console.error(err);
}
