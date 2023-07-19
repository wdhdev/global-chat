import ExtendedClient from "../classes/ExtendedClient";
import { ContextMenuCommandInteraction } from "discord.js";

import fs from "fs";
import getDirs from "../util/getDirs";

export = async (client: ExtendedClient) => {
    async function loadRoot() {
        const files = fs.readdirSync(`./dist/context-menu`).filter((file: String) => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${file}`);

            client.contextCommands.set(`${command.type}-${command.name}`, command);

            console.log(`Loaded Context Command: ${command.name}`);
        }
    }

    async function loadDir(dir: String) {
        const files = fs.readdirSync(`./dist/context-menu/${dir}`).filter((file: String) => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../context-menu/${dir}/${file}`);

            client.contextCommands.set(`${command.type}-${command.name}`, command);

            console.log(`Loaded Context Command: ${command.name}`);
        }
    }

    await loadRoot();
    (await getDirs("./dist/context-menu")).forEach((dir: String) => loadDir(dir));

    client.logContextError = async function (err: Error, interaction: ContextMenuCommandInteraction, Discord: any) {
        const id = client.sentry.captureException(err);
        console.error(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setTitle("💥 An error occurred")
            .setDescription(`\`\`\`${err.message}\`\`\``)
            .addFields (
                { name: "Error ID", value: id }
            )
            .setTimestamp()

        await interaction.editReply({ embeds: [error] });
    }

    require("dotenv").config();
}