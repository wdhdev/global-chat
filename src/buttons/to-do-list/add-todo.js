const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");
const todoSchema = require("../../models/todoSchema");

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

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal-${interaction.id}`)
            .setTitle("Add Task")

        const modalName = new Discord.TextInputBuilder()
            .setCustomId(`modal-name-${interaction.id}`)
            .setStyle(Discord.TextInputStyle.Short)
            .setLabel("Name")
            .setMinLength(3)
            .setMaxLength(50)
            .setRequired(true)

        const modalDescription = new Discord.TextInputBuilder()
            .setCustomId(`modal-description-${interaction.id}`)
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setLabel("Description")
            .setMaxLength(500)

        const firstRow = new Discord.ActionRowBuilder().addComponents(modalName);
        const secondRow = new Discord.ActionRowBuilder().addComponents(modalDescription);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);

        client.on("interactionCreate", async i => {
            if(!i.isModalSubmit()) return;

            if(i.customId === `modal-${interaction.id}`) {
                const name = i.fields.getTextInputValue(`modal-name-${interaction.id}`);
                const description = i.fields.getTextInputValue(`modal-description-${interaction.id}`) ?? "*No description provided.*";

                const menu = new Discord.StringSelectMenuBuilder()
                    .setCustomId(`select-menu-${interaction.id}`)
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

                    if(i2.customId === `select-menu-${interaction.id}`) {
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
                            .setTitle("📝 To-Do List")
                            .setDescription(todoList.length ? todoList.join("\n") : "*There are no tasks.*")
                            .addFields (
                                { name: "❗ Priority", value: `🔴 High\n🟠 Medium\n🟢 Low\n⚪ None` }
                            )
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
