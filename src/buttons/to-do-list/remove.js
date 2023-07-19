const emoji = require("../../config").emojis;

const Task = require("../../models/Task");

module.exports = {
    name: "remove-task",
    startsWith: false,
    requiredRoles: ["dev"],
    async execute(interaction, client, Discord) {
        const data = await Task.find();

        const priority = {
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

        const row = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({ components: [row], ephemeral: true });

        client.on("interactionCreate", async i => {
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

                await todo.delete();

                const removed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} That task has been removed from the list.`)

                await interaction.editReply({ embeds: [removed], components: [] });

                const newData = await Task.find();

                const todoList = [];

                for(const task of newData) {
                    todoList.push(`${priority[task.priority]} ${task.name}`);
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
}
