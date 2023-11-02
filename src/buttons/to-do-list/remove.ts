import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction, Interaction } from "discord.js";

import { emojis as emoji } from "../../config";

import Task from "../../models/Task";

const button: Button = {
    name: "remove-task",
    startsWith: false,
    requiredRoles: ["dev"],
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        const data = await Task.find({});

        const priority: any = {
            high: "🔴",
            medium: "🟠",
            low: "🟢",
            none: "⚪"
        }

        if(!data.length) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.cross} There are no tasks!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`select-menu-${interaction.id}`)
            .setPlaceholder("Select a task to remove")

        for(const todo of data) {
            menu.addOptions (
                new Discord.StringSelectMenuOptionBuilder()
                    .setEmoji(priority[todo.priority])
                    .setLabel(todo.name)
                    .setValue(todo._id)
            )
        }

        const row: any = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({ components: [row], ephemeral: true });

        client.on("interactionCreate", async (i: Interaction) => {
            if(!i.isStringSelectMenu()) return;

            if(i.customId === `select-menu-${interaction.id}`) {
                const value = i.values[0];

                const todo = await Task.findOne({ _id: value });
                const message = interaction.message;

                if(!todo) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} That task does not exist!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await todo.deleteOne();

                const removed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} That task has been removed from the list.`)

                await interaction.editReply({ embeds: [removed], components: [] });

                const newData = await Task.find({});

                const todoList = [];

                for(const task of newData) {
                    todoList.push(`- ${task.name}`);
                }

                const list = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("📝 To-Do List")
                    .setDescription(todoList.length ? todoList.join("\n") : "*There are no tasks.*")
                    .setTimestamp()

                try {
                    await message.edit({ embeds: [list] });
                } catch {}
            }
        })
    }
}

export = button;
