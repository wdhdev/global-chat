import ExtendedClient from "../classes/ExtendedClient";
import { REST, Routes } from "discord.js";

import fs from "fs";
import getDirs from "../util/getDirs";

require("dotenv").config();

export default async function (client: ExtendedClient) {
    const commands: any[] = [];

    const rest = new REST({ version: "9" }).setToken(process.env.token);

    // Push Slash Commands
    await pushCommandsRoot();
    (await getDirs("./dist/commands")).forEach(dir => pushCommandsDir(dir));

    // Push Context Menu Commands
    await pushContextMenuRoot();
    (await getDirs("./dist/context-menu")).forEach(dir => pushContextMenuDir(dir));

    (async () => {
        try {
            console.log("Registering global commands...");

            const applicationCommands: any = await rest.put(Routes.applicationCommands(process.env.clientId), { body: commands });

            for(const command of applicationCommands) {
                client.commandIds.set(command.name, command.id);
            }

            console.log("Registered global commands!");
        } catch(err) {
            client.sentry.captureException(err);
            console.error(err);

            console.error("Failed to register global commands!");
        }
    })()

    // Slash Commands
    async function pushCommandsRoot() {
        const files = fs.readdirSync(`./dist/commands`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${file}`);
            if(command.enabled && !command.staffOnly) commands.push(command);
        }
    }

    async function pushCommandsDir(dir: String) {
        const files = fs.readdirSync(`./dist/commands/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${dir}/${file}`);
            if(command.enabled && !command.staffOnly) commands.push(command);
        }
    }

    // Context Menu Commands
    async function pushContextMenuRoot() {
        const files = fs.readdirSync(`./dist/context-menu`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${file}`);
            if(command.enabled && !command.staffOnly) commands.push(command);
        }
    }

    async function pushContextMenuDir(dir: String) {
        const files = fs.readdirSync(`./dist/context-menu/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${dir}/${file}`);
            if(command.enabled && !command.staffOnly) commands.push(command);
        }
    }
}
