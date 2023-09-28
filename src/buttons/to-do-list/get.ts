import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction, Interaction } from "discord.js";

import { emojis as emoji } from "../../config";

import Task from "../../models/Task";

const button: Button = {
    name: "get-task",
    startsWith: false,
    requiredRoles: [],
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        const data = await Task.find({});

        const priority: any = {
            high: "🔴",
            medium: "🟠",
            low: "🟢",
            none: "⚪",
            text: {
                high: "🔴 High",
                medium: "🟠 Medium",
                low: "🟢 Low",
                none: "⚪ None"
            }
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
            .setPlaceholder("Select a task")

        for(const todo of data) {
            menu.addOptions (
                new Discord.StringSelectMenuOptionBuilder()
                    .setEmoji(`${priority[todo.priority]}`)
                    .setLabel(`${todo.name}`)
                    .setValue(todo._id)
            )
        }

        const row: any = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({ components: [row], ephemeral: true });

        client.on("interactionCreate", async (i : Interaction) => {
            if(!i.isStringSelectMenu()) return;

            if(i.customId === `select-menu-${interaction.id}`) {
                const value = i.values[0];

                const todo = await Task.findOne({ _id: value });

                if(!todo) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} That task does not exist!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle(`${todo.name}`)
                    .setDescription(`${todo.description || "*No description provided.*"}`)
                    .addFields (
                        { name: "❗ Priority", value: priority.text[todo.priority], inline: true },
                        { name: "🕰️ Created", value: `<t:${todo.timestamp.slice(0, -3)}>`, inline: true },
                        { name: "👤 Added By", value: `<@${todo.added_by}>`, inline: true }
                    )

                await interaction.editReply({ embeds: [info], components: [] });
            }
        })
    }
}

export = button;
