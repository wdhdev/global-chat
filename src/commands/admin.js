const emoji = require("../config.json").emojis;

const appealSchema = require("../models/appealSchema");
const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");
const verifiedSchema = require("../models/verifiedSchema");

module.exports = {
	name: "admin",
	description: "Admin Commands",
    options: [
        {
            type: 2,
            name: "appeal",
            description: "Manage appeals.",
            options: [
                {
                    type: 1,
                    name: "delete",
                    description: "Delete an appeal.",
                    options: [
                        {
                            type: 3,
                            name: "id",
                            description: "The ID of the appeal.",
                            min_length: 36,
                            max_length: 36,
                            required: true
                        }
                    ]
                }
            ]
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
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            if(!dev && interaction.user.id !== client.config_default.owner) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(interaction.options.getSubcommandGroup() === "appeal") {
                const id = interaction.options.getString("id");

                if(interaction.options.getSubcommand() === "delete") {
                    if(!await appealSchema.exists({ _id: id })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} Please specify a valid appeal ID!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    await appealSchema.findOneAndDelete({ _id: id });

                    const deleted = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} The appeal has been deleted!`)

                    await interaction.editReply({ embeds: [deleted] });

                    const appealLog = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("Appeal Deleted")
                        .addFields (
                            { name: "ID", value: `${id}` },
                            { name: "Moderator", value: `${interaction.user}` }
                        )
                        .setTimestamp()

                    modLogsChannel.send({ embeds: [appealLog] });
                    return;
                }

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

                    modSchema.findOne({ _id: user.id }, async (err, data) => {
                        if(!data) {
                            data = new modSchema({ _id: user.id });

                            await data.save();

                            const added = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.default)
                                .setDescription(`${emoji.successful} ${user} has been added to the moderator role.`)

                            await interaction.editReply({ embeds: [added] });
                            return;
                        }

                        if(data) {
                            const error = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setDescription(`${emoji.error} ${user} is already a moderator!`)

                            await interaction.editReply({ embeds: [error], ephemeral: true });
                            return;
                        }
                    })
                    return;
                }

                if(interaction.options.getSubcommand() === "remove") {
                    modSchema.findOne({ _id: user.id }, async (err, data) => {
                        if(!data) {
                            const error = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setDescription(`${emoji.error} ${user} is not a moderator!`)

                            await interaction.editReply({ embeds: [error], ephemeral: true });
                            return;
                        }

                        if(data) {
                            await data.delete();

                            const removed = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.default)
                                .setDescription(`${emoji.successful} ${user} has been removed from the moderator role.`)

                            await interaction.editReply({ embeds: [removed] });
                            return;
                        }
                    })
                    return;
                }
            }

            if(interaction.options.getSubcommand() === "send-appeal-message") {
                const channel = interaction.options.getChannel("channel");
                const appealChannel = client.channels.cache.get(channel.id);

                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`
						**Submit**
						${emoji.reply} Appeal your ban from the bot.
						**Check**
						${emoji.reply} Check the status of your appeal.
					`)

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
                } catch {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} The ban appeal message could not be sent.`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "unverify") {
                const user = interaction.options.getUser("user");

                verifiedSchema.findOne({ _id: user.id }, async (err, data) => {
                    if(!data) {
                        data = new verifiedSchema({ _id: user.id });

                        await data.save();

                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is not verified!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    if(data) {
                        await data.delete();

                        const unverified = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} ${user} has been unverified!`)

                        await interaction.editReply({ embeds: [unverified] });
                        return;
                    }
                })
                return;
            }

            if(interaction.options.getSubcommand() === "verified") {
                const data = await verifiedSchema.find();

                const users = [];

                for(const item of data) {
                    users.push(item._id);
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
                	.setTitle("Verified Users")
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

                verifiedSchema.findOne({ _id: user.id }, async (err, data) => {
                    if(!data) {
                        data = new verifiedSchema({ _id: user.id });

                        await data.save();

                        const verified = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} ${user} has been verified.`)

                        await interaction.editReply({ embeds: [verified] });
                        return;
                    }

                    if(data) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is already verified!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }
                })
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}