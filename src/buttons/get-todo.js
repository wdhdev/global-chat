const emoji = require("../config.json").emojis;

const todoSchema = require("../models/todoSchema");

module.exports = {
    name: "get-todo",
    startsWith: false,
    async execute(interaction, client, Discord) {
        const data = await todoSchema.find();

        const priority = {
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
                .setDescription(`${emoji.error} There are no tasks!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const id = require("crypto").randomUUID();

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`select-menu-${id}`)
            .setPlaceholder("Select a task")

        for(const todo of data) {
            menu.addOptions (
                new Discord.StringSelectMenuOptionBuilder()
                    .setEmoji(`${priority[todo.priority]}`)
                    .setLabel(`${todo.name}`)
                    .setValue(todo._id)
            )
        }

        const row = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({ components: [row], ephemeral: true });

        client.on("interactionCreate", async i => {
            if(!i.isStringSelectMenu()) return;

            if(i.customId === `select-menu-${id}`) {
                const value = i.values[0];

                const todo = await todoSchema.findOne({ _id: value });

                if(!todo) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} That task does not exist!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle(`${todo.name}`)
                    .setDescription(`${todo.description}`)
                    .addFields (
                        { name: "❗ Priority", value: priority.text[todo.priority] },
                        { name: "🕰️ Timestamp", value: `<t:${todo.timestamp.slice(0, -3)}>` },
                        { name: "👤 Added By", value: `<@${todo.added_by}>` }
                    )

                await interaction.editReply({ embeds: [info], components: [], ephemeral: true });
            }
        })
    }
}
