import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { createLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import Task from "../../models/Task";
import User from "../../models/User";

const command: Command = {
    name: "admin",
    description: "Developer Commands",
    options: [
        {
            type: 1,
            name: "donators",
            description: "[DEVELOPER ONLY] Get a list of all the donators.",
            options: []
        },

        {
            type: 1,
            name: "immune",
            description: "[DEVELOPER ONLY] Get a list of all the immune users.",
            options: []
        },

        {
            type: 2,
            name: "mod",
            description: "Manage the moderator role.",
            options: [
                {
                    type: 1,
                    name: "add",
                    description: "[DEVELOPER ONLY] Promote a user to a moderator.",
                    options: [
                        {
                            type: 6,
                            name: "user",
                            description: "The user to promote.",
                            required: true
                        }
                    ]
                },

                {
                    type: 1,
                    name: "remove",
                    description: "[DEVELOPER ONLY] Demote a user from a moderator.",
                    options: [
                        {
                            type: 6,
                            name: "user",
                            description: "The user to demote.",
                            required: true
                        }
                    ]
                }
            ]
        },

        {
            type: 1,
            name: "send-appeal-menu",
            description: "[DEVELOPER ONLY] Send the appeal menu to a specified channel.",
            options: [
                {
                    type: 7,
                    name: "channel",
                    description: "Channel where the menu should be sent.",
                    channel_types: [0],
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "send-to-do-list",
            description: "[DEVELOPER ONLY] Send the To-Do List to a specified channel.",
            options: [
                {
                    type: 7,
                    name: "channel",
                    description: "Channel where the list should be sent.",
                    channel_types: [0],
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "unverify",
            description: "[DEVELOPER ONLY] Unverify a user.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to unverify.",
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "verified",
            description: "[DEVELOPER ONLY] Get a list of all the verified users.",
            options: []
        },

        {
            type: 1,
            name: "verify",
            description: "[DEVELOPER ONLY] Verify a user.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to verify.",
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: typeof import("discord.js")) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            if(interaction.options.getSubcommand() === "donators") {
                const data = await User.find({ donator: true });

                const users = [];

                for(const user of data) {
                    users.push(user._id);
                }

                if(!users.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There are no donators!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const donators = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("💸 Donators")
                    .setDescription(`<@${users.join(">, <@")}>`)

                await interaction.editReply({ embeds: [donators] });
                return;
            }

            if(interaction.options.getSubcommand() === "immune") {
                const data = await User.find({ immune: true });

                const users = [];

                for(const user of data) {
                    users.push(user._id);
                }

                if(!users.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There are no immune users!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const immuneUsers = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("🔒 Immune Users")
                    .setDescription(`<@${users.join(">, <@")}>`)

                await interaction.editReply({ embeds: [immuneUsers] });
                return;
            }

            if(interaction.options.getSubcommandGroup() === "mod") {
                const user = interaction.options.getUser("user");

                if(interaction.options.getSubcommand() === "add") {
                    if(user.bot) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.cross} You cannot make a bot a moderator!`)

                        await interaction.editReply({ embeds: [error] });
                        return;
                    }

                    const userData = await User.findOne({ _id: user.id });

                    if(userData?.mod) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.cross} ${user} is already a moderator!`)

                        await interaction.editReply({ embeds: [error] });
                        return;
                    }

                    if(!userData) {
                        await new User({ _id: user.id, mod: true }).save();
                    } else {
                        await User.findOneAndUpdate({ _id: user.id }, { mod: true });
                    }

                    await createLog(user.id, null, "roleAdd", "mod", interaction.user.id);

                    const guild = await client.guilds.fetch(client.config_main.primaryGuild);

                    const member = await guild.members.cache.get(user.id);
                    const role = await guild.roles.cache.get(client.config_roles.mod);

                    if(member) member.roles.add(role);

                    const added = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} ${user} has been added to the moderator role.`)

                    await interaction.editReply({ embeds: [added] });

                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("Role Added")
                        .addFields (
                            { name: "🎭 Role", value: "🔨 Moderator" },
                            { name: "👤 User", value: `${user}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                    return;
                }

                if(interaction.options.getSubcommand() === "remove") {
                    if(!await User.exists({ _id: user.id, mod: true })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.cross} ${user} is not a moderator!`)

                        await interaction.editReply({ embeds: [error] });
                        return;
                    }

                    await User.findOneAndUpdate({ _id: user.id }, { mod: false });

                    await createLog(user.id, null, "roleRemove", "mod", interaction.user.id);

                    const guild = await client.guilds.fetch(client.config_main.primaryGuild);

                    const member = await guild.members.cache.get(user.id);
                    const role = await guild.roles.cache.get(client.config_roles.mod);

                    if(member) member.roles.remove(role);

                    const removed = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} ${user} has been removed from the moderator role.`)

                    await interaction.editReply({ embeds: [removed] });

                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("Role Removed")
                        .addFields (
                            { name: "🎭 Role", value: "🔨 Moderator" },
                            { name: "👤 User", value: `${user}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "send-appeal-menu") {
                const channel = interaction.options.getChannel("channel");
                const appealChannel = client.channels.cache.get(channel.id);

                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "📝 Submit", value: "Appeal your ban from the bot." },
                        { name: "👀 Check", value: "Check the status of your appeal." }
                    )

                const buttons = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId("submit-appeal")
                            .setEmoji("📝")
                            .setLabel("Submit"),

                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId("check-appeal")
                            .setEmoji("👀")
                            .setLabel("Check")
                    )

                try {
                    await appealChannel.send({ embeds: [embed], components: [buttons] });

                    const sent = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} The appeal menu has been sent.`)

                    await interaction.editReply({ embeds: [sent] });
                } catch(err) {
                    client.logError(err);

                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} The appeal menu could not be sent.`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "send-to-do-list") {
                const channel = interaction.options.getChannel("channel");
                const appealChannel = client.channels.cache.get(channel.id);

                const data = await Task.find({});

                const todoList = [];

                const priority: any = {
                    high: "🔴",
                    medium: "🟠",
                    low: "🟢",
                    none: "⚪"
                }

                for(const todo of data) {
                    todoList.push(`- ${todo.name}`);
                }

                const list = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("📝 To-Do List")
                    .setDescription(todoList.length ? todoList.join("\n") : "*There are no tasks.*")
                    .setTimestamp()

                const row1 = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Primary)
                            .setCustomId("get-task")
                            .setLabel("Get"),

                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Success)
                            .setCustomId("add-task")
                            .setLabel("Add"),

                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Danger)
                            .setCustomId("remove-task")
                            .setLabel("Remove")
                    )

                const row2 = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId("refresh-task-list")
                            .setLabel("Refresh")
                    )

                try {
                    await appealChannel.send({ embeds: [list], components: [row1, row2] });

                    const sent = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} The list has been sent.`)

                    await interaction.editReply({ embeds: [sent] });
                } catch(err) {
                    client.logError(err);

                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} The list could not be sent.`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "unverify") {
                const user = interaction.options.getUser("user");

                if(!await User.exists({ _id: user.id, verified: true })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is not verified!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await User.findOneAndUpdate({ _id: user.id }, { verified: false });

                await createLog(user.id, null, "roleRemove", "verified", interaction.user.id);

                const guild = await client.guilds.fetch(client.config_main.primaryGuild);

                const member = await guild.members.cache.get(user.id);
                const role = await guild.roles.cache.get(client.config_roles.verified);

                if(member) member.roles.remove(role);

                const unverified = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} has been unverified.`)

                await interaction.editReply({ embeds: [unverified] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Role Removed")
                    .addFields (
                        { name: "🎭 Role", value: "✅ Verified" },
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }

            if(interaction.options.getSubcommand() === "verified") {
                const verified = await User.find({ verified: true });

                const users = [];

                for(const user of verified) {
                    users.push(user._id);
                }

                if(!users.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There are no verified users!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const verifiedUsers = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("✅ Verified Users")
                    .setDescription(`<@${users.join(">, <@")}>`)

                await interaction.editReply({ embeds: [verifiedUsers] });
                return;
            }

            if(interaction.options.getSubcommand() === "verify") {
                const user = interaction.options.getUser("user");

                if(user.bot) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You cannot verify bots!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const userData = await User.findOne({ _id: user.id });

                if(userData?.verified) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is already verified!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                if(!userData) {
                    await new User({ _id: user.id, verified: true }).save();
                } else {
                    await User.findOneAndUpdate({ _id: user.id }, { verified: true });
                }

                await createLog(user.id, null, "roleAdd", "verified", interaction.user.id);

                const guild = await client.guilds.fetch(client.config_main.primaryGuild);

                const member = await guild.members.cache.get(user.id);
                const role = await guild.roles.cache.get(client.config_roles.verified);

                if(member) member.roles.add(role);

                const verified = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} has been verified.`)

                await interaction.editReply({ embeds: [verified] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Role Added")
                    .addFields (
                        { name: "🎭 Role", value: "✅ Verified" },
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
