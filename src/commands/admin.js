const announce = require("../util/announcement");
const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");
const verifiedSchema = require("../models/verifiedSchema");

module.exports = {
	name: "admin",
	description: "Admin Commands",
    options: [
        {
            type: 1,
            name: "announce",
            description: "Send an announcement.",
            options: [
                {
                    type: 3,
                    name: "text",
                    description: "The text for the announcement to include.",
                    max_length: 1024,
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "developers",
            description: "Get a list of all the developers.",
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
                    description: "Promote a user to a moderator.",
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
                    description: "Demote a user from a moderator.",
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
            name: "moderators",
            description: "Get a list of all the moderators.",
            options: []
        },

        {
            type: 1,
            name: "send-appeal-message",
            description: "Send the ban appeal message to a specified channel.",
            options: [
                {
                    type: 7,
                    name: "channel",
                    description: "Channel where the ban appeal message should be sent.",
                    channel_types: [0],
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "supporters",
            description: "Get a list of all the supporters.",
            options: []
        },

        {
            type: 1,
            name: "unverify",
            description: "Unverify a user.",
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
            description: "Get a list of all the verified users.",
            options: []
        },

        {
            type: 1,
            name: "verify",
            description: "Verify a user.",
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
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            if(!dev && interaction.user.id !== client.config_default.owner) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(interaction.options.getSubcommand() === "announce") {
                const text = interaction.options.getString("text");

                await announce(text, interaction, client, Discord);

                const sent = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} The announcement has been sent!`)

                await interaction.editReply({ embeds: [sent] });
                return;
            }

            if(interaction.options.getSubcommand() === "developers") {
                const devs = await devSchema.find();

                const users = [];

                for(const user of devs) {
                    users.push(user._id);
                }

                if(!users.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There are no developers!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const developers = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                	.setTitle("💻 Developers")
                    .setDescription(`<@${users.join(">\n<@")}>`)

                await interaction.editReply({ embeds: [developers] });
                return;
            }

            if(interaction.options.getSubcommandGroup() === "mod") {
                const user = interaction.options.getUser("user");

                if(interaction.options.getSubcommand() === "add") {
                    if(user.bot) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} You cannot make a bot a moderator!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    if(await modSchema.exists({ _id: user.id })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is already a moderator!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    data = new modSchema({ _id: user.id });

                    await data.save();

                    const added = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} ${user} has been added to the moderator role.`)

                    await interaction.editReply({ embeds: [added] });

                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
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
                    if(!await modSchema.exists({ _id: user.id })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is not a moderator!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    await modSchema.findOneAndDelete({ _id: user.id });

                    const removed = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} ${user} has been removed from the moderator role.`)

                    await interaction.editReply({ embeds: [removed] });

                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("Role Removed")
                        .addFields (
                            { name: "🎭 Role", value: "🔨 Moderator" },
                            { name: "👤 User", value: `${user}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                    return;
                }
            }

            if(interaction.options.getSubcommand() === "moderators") {
                const mods = await modSchema.find();

                const users = [];

                for(const user of mods) {
                    users.push(user._id);
                }

                if(!users.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There are no moderators!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const moderators = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                	.setTitle("🔨 Moderators")
                    .setDescription(`<@${users.join(">\n<@")}>`)

                await interaction.editReply({ embeds: [moderators] });
                return;
            }

            if(interaction.options.getSubcommand() === "send-appeal-message") {
                const channel = interaction.options.getChannel("channel");
                const appealChannel = client.channels.cache.get(channel.id);

                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "Submit", value: "Appeal your ban from the bot." },
                        { name: "Check", value: "Check the status of your appeal." }
                    )

                const buttons = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Success)
                            .setCustomId("submit-appeal")
                            .setLabel("Submit"),

                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Primary)
                            .setCustomId("check-appeal")
                            .setLabel("Check")
                    )

                try {
                	await appealChannel.send({ embeds: [embed], components: [buttons] });

                    const sent = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} The appeal message has been sent.`)

                    await interaction.editReply({ embeds: [sent] });
                } catch(err) {
                    client.logCommandError(err, interaction, Discord);

                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} The ban appeal message could not be sent.`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "supporters") {
                const guild = await client.guilds.fetch(client.config_default.server);
                const members = await guild.members.fetch();
                const boosters = members.filter(member => member.premiumSinceTimestamp);

                console.log(boosters);

                const users = [];

                for(const user of boosters) {
                    users.push(user.id);
                }

                if(!users.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There are no supporters!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const supporters = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                	.setTitle("💖 Supporters")
                    .setDescription(`<@${users.join(">\n<@")}>`)

                await interaction.editReply({ embeds: [supporters] });
                return;
            }

            if(interaction.options.getSubcommand() === "unverify") {
                const user = interaction.options.getUser("user");

                if(!await verifiedSchema.exists({ _id: user.id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} ${user} is not verified!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                await modSchema.findOneAndDelete({ _id: user.id });

                const unverified = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} ${user} has been unverified!`)

                await interaction.editReply({ embeds: [unverified] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
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
                const verified = await verifiedSchema.find();

                const users = [];

                for(const user of verified) {
                    users.push(user._id);
                }

                if(!users.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There are no verified users!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const verifiedUsers = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                	.setTitle("✅ Verified Users")
                    .setDescription(`<@${users.join(">\n<@")}>`)

                await interaction.editReply({ embeds: [verifiedUsers] });
                return;
            }

            if(interaction.options.getSubcommand() === "verify") {
                const user = interaction.options.getUser("user");

                if(user.bot) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} You cannot verify bots!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                if(await verifiedSchema.exists({ _id: user.id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} ${user} is already verified!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                data = new verifiedSchema({ _id: user.id });

                await data.save();

                const verified = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} ${user} has been verified.`)

                await interaction.editReply({ embeds: [verified] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
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
