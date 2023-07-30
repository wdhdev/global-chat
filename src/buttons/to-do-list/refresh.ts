import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction } from "discord.js";

import Task from "../../models/Task";

const button: Button = {
    name: "refresh-task-list",
    startsWith: false,
    requiredRoles: ["dev"],
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: any) {
        const data = await Task.find();

        const todoList = [];

        for(const todo of data) {
            todoList.push(`- ${todo.name}`);
        }

        const list = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setTitle("📝 To-Do List")
            .setDescription(todoList.length ? todoList.join("\n") : "*There are no tasks.*")
            .setTimestamp()

        await interaction.message.edit({ embeds: [list] });

        await interaction.deferUpdate();
    }
}

export = button;
