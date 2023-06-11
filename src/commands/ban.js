const emoji = require("../config.json").emojis;

const bannedGuildSchema = require("../models/bannedGuildSchema");
const bannedUserSchema = require("../models/bannedUserSchema");
const channelSchema = require("../models/channelSchema");
const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");

module.exports = {
    name: "ban",
    description: "Ban a user or guild.",
    options: [
        {
            type: 1,
            name: "guild",
            description: "Ban a guild.",
            options: [
                {
                    type: 3,
                    name: "id",
                    description: "The ID of the guild you want to ban.",
                    min_length: 17,
                    max_length: 19,
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "Why you want to ban the guild.",
                    max_length: 1024,
                    required: true
                }
            ]
        },

        {
            type: 2,
            name: "info",
            description: "Get information about a ban.",
            options: [
                {
                    type: 1,
                    name: "guild",
                    description: "Get information about a guild ban.",
                    options: [
                        {
                            type: 3,
                            name: "id",
                            description: "The ID of the guild to get ban information from.",
                            required: true
                        }
                    ]
                },

                {
                    type: 1,
                    name: "user",
                    description: "Get information about a user's ban.",
                    options: [
                        {
                            type: 6,
                            name: "user",
                            description: "The user who's ban information to get.",
                            required: true
                        }
                    ]
                }
            ]
        },

        {
            type: 1,
            name: "user",
            description: "Ban a user.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user you want to ban.",
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "Why you want to ban the user.",
                    max_length: 1024,
                    required: true
                },

                {
                    type: 5,
                    name: "appealable",
                    description: "Do you want this user to be able to appeal?",
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
            const mod = await modSchema.exists({ _id: interaction.user.id });
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            check:
            if(mod || dev) {
                break check;
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const reason = interaction.options.getString("reason");

            if(interaction.options.getSubcommand() === "guild") {
                const id = interaction.options.getString("id");

                bannedGuildSchema.findOne({ _id: id }, async (err, data) => {
                    if(!data) {
                        data = new bannedGuildSchema({
                            _id: id,
                            timestamp: Date.now(),
                            reason: reason,
                            mod: interaction.user.id
                        })

                        await data.save();

                        const guild = client.guilds.cache.get(id);

                        if(guild) {
                            guild.leave();
                            console.log(`[BAN] Left Guild: ${id}`);
                        }

                        await channelSchema.findOneAndDelete({ _id: id });

                        const banned = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} Banned Guild: \`${id}\``)

                        await interaction.editReply({ embeds: [banned] });

                        const banLog = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setTitle("🔨 Guild Banned")
                            .addFields (
                                { name: "🔢 Guild ID", value: id },
                                { name: "🔨 Moderator", value: interaction.user },
                                { name: "❓ Reason", value: `${reason}` }
                            )
                            .setTimestamp()

                        modLogsChannel.send({ embeds: [banLog] });
                        return;
                    }

                    if(data) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} That guild is already banned!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }
                })

                return;
            }

            if(interaction.options.getSubcommandGroup() === "info") {
                if(interaction.options.getSubcommand() === "guild") {
                    const id = interaction.options.getString("id");

                    if(!await bannedGuildSchema.exists({ _id: id })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} The guild \`${id}\` is not banned!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const data = await bannedGuildSchema.findOne({ _id: id });

                    if(!data.timestamp || !data.reason || !data.mod) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} No information is available about this ban!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const banInfo = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("ℹ️ Ban Information")
                        .addFields (
                            { name: "🕰️ Timestamp", value: `<t:${data.timestamp.slice(0, -3)}>` },
                            { name: "❓ Reason", value: `${data.reason}` },
                            { name: "🔨 Moderator", value: `<@${data.mod}>` }
                        )

                    await interaction.editReply({ embeds: [banInfo] });
                    return;
                }

                if(interaction.options.getSubcommand() === "user") {
                    const user = interaction.options.getUser("user");

                    if(!await bannedUserSchema.exists({ _id: user.id })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is not banned!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const data = await bannedUserSchema.findOne({ _id: user.id });

                    if(!data.timestamp || !data.reason || !data.mod) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} No information is available about this ban!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const banInfo = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: user.tag.endsWith("#0") ? `@${user.username}` : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` })
                        .setTitle("ℹ️ Ban Information")
                        .addFields (
                            { name: "🕰️ Timestamp", value: `<t:${data.timestamp.slice(0, -3)}>` },
                            { name: "❓ Reason", value: `${data.reason}` },
                            { name: "📜 Appealable", value: data.allowAppeal ? "✅" : "❌" },
                            { name: "🔨 Moderator", value: `<@${data.mod}>` }
                        )

                    await interaction.editReply({ embeds: [banInfo] });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "user") {
                const user = interaction.options.getUser("user");
                const appealable = interaction.options.getBoolean("appealable");

                if(user.id === interaction.user.id) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} You cannot ban yourself!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                bannedUserSchema.findOne({ _id: user.id }, async (err, data) => {
                    if(!data) {
                        data = new bannedUserSchema({
                            _id: user.id,
                            timestamp: Date.now(),
                            allowAppeal: appealable,
                            reason: reason,
                            mod: interaction.user.id
                        })

                        await data.save();

                        const banned = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} ${user} has been banned.`)

                        await interaction.editReply({ embeds: [banned] });

                        const banLog = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setTitle("🔨 User Banned")
                            .addFields (
                                { name: "👤 User", value: user },
                                { name: "❓ Reason", value: `${reason}` },
                                { name: "📜 Appealable", value: appealable ? "✅" : "❌" },
                                { name: "🔨 Moderator", value: interaction.user }
                            )
                            .setTimestamp()

                        modLogsChannel.send({ embeds: [banLog] });
                        return;
                    }

                    if(data) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is already banned!`)

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