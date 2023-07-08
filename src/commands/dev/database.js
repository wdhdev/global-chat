const emoji = require("../../config.json").emojis;
const mongoose = require("mongoose");

module.exports = {
	name: "database",
	description: "Manage the bot's database.",
    options: [
        {
            type: 1,
            name: "cleanup",
            description: "[DEVELOPER ONLY] Clean up a specific collection in the database.",
            options: [
                {
                    type: 3,
                    name: "collection",
                    description: "The collection to clean up.",
                    choices: [
                        {
                            name: "banned-users",
                            description: "Clean up the banned-users collection.",
                            value: "banned-users"
                        },

                        {
                            name: "channels",
                            description: "Clean up the channels collection.",
                            value: "channels"
                        },

                        {
                            name: "filter",
                            description: "Clean up the filter collection.",
                            value: "filter"
                        }
                    ],
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "reconnect",
            description: "[DEVELOPER ONLY] Reconnect the bot to the database.",
            options: []
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 0,
    enabled: true,
    hidden: true,
    deferReply: true,
    ephemeral: true,
	async execute(interaction, client, Discord) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            if(interaction.options.getSubcommand() === "cleanup") {
                const collection = interaction.options.getString("collection");

                if(collection === "banned-users") {
                    const cleanBannedUsers = require("../../util/database/cleanBannedUsers");

                    const res = await cleanBannedUsers(client);

                    const result = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("🧹 Collection Cleanup")
                        .setDescription("`banned-users`")
                        .addFields (
                            { name: "🗑️ Removed Documents", value: res.removed.length ? `\`\`\`${res.removed.join("\n")}\`\`\`` : "*None*" }
                        )

                    await interaction.editReply({ embeds: [result] });

                    if(res.removed.length) {
                        result.setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` });
                        result.setTimestamp();

                        logsChannel.send({ embeds: [result] });
                    }

                    return;
                }

                if(collection === "channels") {
                    const cleanChannels = require("../../util/database/cleanChannels");

                    const res = await cleanChannels(client);

                    const result = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("🧹 Collection Cleanup")
                        .setDescription("`channels`")
                        .addFields (
                            { name: "📝 Modified Documents", value: res.modified.length ? `\`\`\`${res.modified.join("\n")}\`\`\`` : "*None*" },
                            { name: "🗑️ Removed Documents", value: res.removed.length ? `\`\`\`${res.removed.join("\n")}\`\`\`` : "*None*" }
                        )

                    await interaction.editReply({ embeds: [result] });

                    if(res.modified.length || res.removed.length) {
                        result.setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` });
                        result.setTimestamp();

                        logsChannel.send({ embeds: [result] });
                    }

                    return;
                }

                if(collection === "filter") {
                    const cleanFilter = require("../../util/database/cleanFilter");

                    const res = await cleanFilter(client);

                    const result = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("🧹 Collection Cleanup")
                        .setDescription("`filter`")
                        .addFields (
                            { name: "📝 Modified Documents", value: res.modified.length ? `\`\`\`${res.modified.join("\n")}\`\`\`` : "*None*" },
                            { name: "🗑️ Removed Documents", value: res.removed.length ? `\`\`\`${res.removed.join("\n")}\`\`\`` : "*None*" }
                        )

                    await interaction.editReply({ embeds: [result] });

                    if(res.removed.length) {
                        result.setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` });
                        result.setTimestamp();

                        logsChannel.send({ embeds: [result] });
                    }

                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "reconnect") {
                await mongoose.connection.close();
                console.log("Disconnected from Database!");

                const database = require("../../util/database/connect");
                await database();

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} Reconnected to the database!`)

                await interaction.editReply({ embeds: [result] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
