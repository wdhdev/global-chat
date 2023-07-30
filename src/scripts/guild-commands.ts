import ExtendedClient from "../classes/ExtendedClient";
import { REST, Routes } from "discord.js";

import fs from "fs";
import { getDirs } from "../util/functions";

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
            for(const [guildId, guild] of client.guilds.cache) {
                try {
                    await rest.put(Routes.applicationGuildCommands(process.env.clientId, guildId), { body: [] });
                } catch {}
            }

            try {
                await rest.put(Routes.applicationGuildCommands(process.env.clientId, client.config_main.primaryGuild), { body: commands });
                console.log(`Registered guild commands to ${client.config_main.primaryGuild}!`);
            } catch(err) {
                console.log(`Failed to register guild commands to ${client.config_main.primaryGuild}!`);
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
            if(command.enabled && command.guildOnly) commands.push(command);
        }
    }

    async function pushCommandsDir(dir: String) {
        const files = fs.readdirSync(`./dist/commands/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${dir}/${file}`);
            if(command.enabled && command.guildOnly) commands.push(command);
        }
    }

    // Context Menu Commands
    async function pushContextMenuRoot() {
        const files = fs.readdirSync(`./dist/context-menu`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${file}`);
            if(command.enabled && command.guildOnly) commands.push(command);
        }
    }

    async function pushContextMenuDir(dir: String) {
        const files = fs.readdirSync(`./dist/context-menu/${dir}`).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${dir}/${file}`);
            if(command.enabled && command.guildOnly) commands.push(command);
        }
    }
}
