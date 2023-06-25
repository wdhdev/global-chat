const todoSchema = require("../../models/todoSchema");

module.exports = {
    name: "refresh-todo-list",
    startsWith: false,
    async execute(interaction, client, Discord) {
        const data = await todoSchema.find();

        const todoList = [];

        const priority = {
            high: "🔴",
            medium: "🟠",
            low: "🟢",
            none: "⚪"
        }

        for(const todo of data) {
            todoList.push(`${priority[todo.priority]} ${todo.name}`);
        }

        const list = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setTitle("To-Do List")
            .setDescription(todoList.length ? todoList.join("\n") : "*There are no tasks.*")
            .setTimestamp()

        const priorityEmbed = new Discord.EmbedBuilder()
            .setTitle("Priority")
            .setDescription(`🔴 High\n🟠 Medium\n🟢 Low\n⚪ None`)

        try {
            await interaction.message.edit({ embeds: [list, priorityEmbed] });
        } catch {}

        await interaction.deferUpdate();
    }
}
