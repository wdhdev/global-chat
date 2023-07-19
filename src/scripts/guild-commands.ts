import CustomClient from "../classes/CustomClient";
import { REST, Routes } from "discord.js";

import fs from "fs";
import getDirs from "../util/getDirs";

require("dotenv").config();

export default async function (client: CustomClient) {
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
            for(const guild of client.config_default.hasGuildOnlyCommands) {
                try {
                    await rest.put(Routes.applicationGuildCommands(process.env.clientId, guild), { body: commands });
                    console.log(`Registered guild commands to ${guild}!`);
                } catch(err) {
                    console.log(`Failed to register guild commands to ${guild}!`);
                    continue;
                }
            }
        } catch(err) {
            client.sentry.captureException(err);
            console.error(err);

            console.error("Failed to register guild commands!");
        }
    })()

    // Slash Commands
    async function pushCommandsRoot() {
        const files = fs.readdirSync(`./dist/commands`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }

    async function pushCommandsDir(dir: String) {
        const files = fs.readdirSync(`./dist/commands/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${dir}/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }

    // Context Menu Commands
    async function pushContextMenuRoot() {
        const files = fs.readdirSync(`./dist/context-menu`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }

    async function pushContextMenuDir(dir: String) {
        const files = fs.readdirSync(`./dist/context-menu/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${dir}/${file}`);
            if(command.enabled && command.staffOnly) commands.push(command);
        }
    }
}
