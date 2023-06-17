const emoji = require("../config.json").emojis;

const bannedGuildSchema = require("../models/bannedGuildSchema");
const bannedUserSchema = require("../models/bannedUserSchema");
const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");

module.exports = {
    name: "unban",
    description: "Unban a user or guild.",
    options: [
        {
            type: 1,
            name: "guild",
            description: "Unban a guild.",
            options: [
                {
                    type: 3,
                    name: "id",
                    description: "The ID of the guild you want to unban.",
                    min_length: 17,
                    max_length: 19,
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "Why you want to unban the guild.",
                    max_length: 1024,
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "user",
            description: "Unban a user.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user you want to unban.",
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "Why you want to unban the user.",
                    max_length: 1024,
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
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} That guild is not banned!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    if(data) {
                        await data.delete();

                        const unbanned = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} Unbanned Guild: \`${id}\``)

                        await interaction.editReply({ embeds: [unbanned] });

                        const banLog = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setTitle("Guild Unbanned")
                            .addFields (
                                { name: "🔢 Guild ID", value: `${id}` },
                                { name: "❓ Reason", value: `${reason}` },
                                { name: "🔨 Moderator", value: `${interaction.user}` },
                            )
                            .setTimestamp()

                        modLogsChannel.send({ embeds: [banLog] });
                        return;
                    }
                })

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

                await bannedGuildSchema.findOneAndDelete({ _id: user.id });

                const userDM = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.green)
                    .setTitle("Unbanned")
                    .setDescription(`${emoji.successful} You have been unbanned from Global Chat.`)
                    .setTimestamp()

                let sentDM = false;

                try {
                    const user = await client.users.fetch(data._id);
                    await user.send({ embeds: [userDM] });

                    sentDM = true;
                } catch {}

                const unbanned = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} ${user} has been unbanned.`)

                await interaction.editReply({ embeds: [unbanned] });

                const banLog = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("User Unbanned")
                    .addFields (
                        { name: "👤 User", value: `${user}` },
                        { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                        { name: "❓ Reason", value: `${reason}` },
                        { name: "🔨 Moderator", value: `${interaction.user}` },
                    )
                    .setTimestamp()

                modLogsChannel.send({ embeds: [banLog] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}