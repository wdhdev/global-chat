const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");
const todoSchema = require("../models/todoSchema");

module.exports = {
    name: "add-todo",
    startsWith: false,
    async execute(interaction, client, Discord) {
        const dev = await devSchema.exists({ _id: interaction.user.id });

        if(!dev) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} You do not have permission to perform this action!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const todoData = await todoSchema.find();

        if(todoData.length >= 25) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} There cannot be more than 25 tasks!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const priorityIcons = {
            high: "🔴",
            medium: "🟠",
            low: "🟢",
            none: "⚪"
        }

        const id = require("crypto").randomUUID();

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal-${id}`)
            .setTitle("Add Task")

        const modalName = new Discord.TextInputBuilder()
            .setCustomId(`modal-name-${id}`)
            .setStyle(Discord.TextInputStyle.Short)
            .setLabel("Name")
            .setMinLength(3)
            .setMaxLength(50)
            .setRequired(true)

        const modalDescription = new Discord.TextInputBuilder()
            .setCustomId(`modal-description-${id}`)
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setLabel("Description")
            .setMinLength(10)
            .setMaxLength(200)
            .setRequired(true)

        const firstRow = new Discord.ActionRowBuilder().addComponents(modalName);
        const secondRow = new Discord.ActionRowBuilder().addComponents(modalDescription);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);

        client.on("interactionCreate", async i => {
            if(!i.isModalSubmit()) return;

            if(i.customId === `modal-${id}`) {
                const name = i.fields.getTextInputValue(`modal-name-${id}`);
                const description = i.fields.getTextInputValue(`modal-description-${id}`);

                const menu = new Discord.StringSelectMenuBuilder()
                    .setCustomId(`select-menu-${id}`)
                    .setPlaceholder("Select a priority")
                    .addOptions (
                        new Discord.StringSelectMenuOptionBuilder()
                            .setEmoji("🔴")
                            .setLabel("High")
                            .setValue("high"),

                        new Discord.StringSelectMenuOptionBuilder()
                            .setEmoji("🟠")
                            .setLabel("Medium")
                            .setValue("medium"),

                        new Discord.StringSelectMenuOptionBuilder()
                            .setEmoji("🟢")
                            .setLabel("Low")
                            .setValue("low"),

                        new Discord.StringSelectMenuOptionBuilder()
                            .setEmoji("⚪")
                            .setLabel("None")
                            .setValue("none")
                    )

                const row = new Discord.ActionRowBuilder().addComponents(menu);

                await i.reply({ components: [row], ephemeral: true });

                client.on("interactionCreate", async i2 => {
                    if(!i2.isStringSelectMenu()) return;

                    if(i2.customId === `select-menu-${id}`) {
                        const priority = i2.values[0];

                        const message = interaction.message;
                        const taskId = require("crypto").randomUUID();

                        data = new todoSchema({
                            _id: taskId,
                            timestamp: Date.now(),
                            added_by: interaction.user.id,
                            priority: priority,
                            name: name,
                            description: description
                        }).save()

                        const added = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} The task has been added to the list.`)

                        await i.editReply({ embeds: [added], components: [], ephemeral: true });

                        const newData = await todoSchema.find();

                        const todoList = [];

                        for(const task of newData) {
                            todoList.push(`${priorityIcons[task.priority]} ${task.name}`);
                        }

                        const list = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setTitle("To-Do List")
                            .setDescription(todoList.length ? todoList.join("\n") : "*There are no tasks.*")
                            .setTimestamp()

                        try {
                            await message.edit({ embeds: [list] });
                        } catch {}
                    }
                })
            }
        })
    }
}
