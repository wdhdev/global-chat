const announce = require("../util/announcement");
const cdn = require("@globalchat/cdn");
const emoji = require("../config.json").emojis;

const appealSchema = require("../models/appealSchema");
const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");

module.exports = {
	name: "mod",
	description: "Moderator Commands",
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
            type: 2,
            name: "appeal",
            description: "Manage user appeals.",
            options: [
                {
                    type: 1,
                    name: "get",
                    description: "Get information about an appeal.",
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
            name: "cdn",
            description: "Manage files on the CDN.",
            options: [
                {
                    type: 1,
                    name: "delete",
                    description: "Delete a user's image stored on the CDN.",
                    options: [
                        {
                            type: 6,
                            name: "user",
                            description: "The user who's file you want to delete.",
                            required: true
                        },

                        {
                            type: 3,
                            name: "file",
                            description: "The name of the file you want to delete.",
                            min_length: 40,
                            max_length: 41,
                            required: true
                        },

                        {
                            type: 3,
                            name: "reason",
                            description: "Why you want to delete the file.",
                            required: true
                        }
                    ]
                } // ,

                // {
                //     type: 1,
                //     name: "delete-nsfw",
                //     description: "Delete a flagged NSFW image stored on the CDN.",
                //     options: [
                //         {
                //             type: 6,
                //             name: "user",
                //             description: "The user who's file you want to delete.",
                //             required: true
                //         },

                //         {
                //             type: 3,
                //             name: "file",
                //             description: "The name of the file you want to delete.",
                //             min_length: 40,
                //             max_length: 41,
                //             required: true
                //         }
                //     ]
                // }
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

            if(interaction.options.getSubcommand() === "announce") {
                const text = interaction.options.getString("text");

                await announce(interaction, text, client, Discord);

                const sent = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} The announcement has been sent!`)

                await interaction.editReply({ embeds: [sent] });
                return;
            }

            if(interaction.options.getSubcommandGroup() === "appeal") {
                const id = interaction.options.getString("id");

                if(interaction.options.getSubcommand() === "get") {
                    if(!await appealSchema.exists({ _id: id })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} Please specify a valid appeal ID!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const data = await appealSchema.findOne({ _id: id });

                    const state = {
                        "APPROVED": `${emoji.green_circle} Approved`,
                        "DENIED": `${emoji.red_circle} Denied`,
                        "NOT_REVIEWED": `${emoji.orange_circle} Pending Review`
                    }

                    const appealData = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                    	.setDescription(`
							**Appeal**
							${emoji.reply} ${id}
							**User**
							${emoji.reply} <@${data.id}>

							**Ban Reason** (*user provided*)
							${emoji.reply} ${data.ban_reason}
							**Unban Reason** (*user provided*)
							${emoji.reply} ${data.unban_reason}

							**Status**
							${emoji.reply} ${state[data.status]}
							${data.status !== "NOT_REVIEWED" ? `**Moderator**\n${emoji.reply} <@${data.mod}>` : ""}
							${data.status !== "NOT_REVIEWED" ? `**Reason**\n${emoji.reply} ${data.reason}` : ""}
						`)

                    await interaction.editReply({ embeds: [appealData] });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommandGroup() === "cdn") {
                const user = interaction.options.getUser("user");

                if(interaction.options.getSubcommand() === "delete") {
                    const file = interaction.options.getString("file");
                    const reason = interaction.options.getString("reason");

                    const res = await cdn.delete(client.token, file, user.id);

                    if(res.status === 204) {
                        const deleted = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} The file has been deleted from the CDN.`)

                        await interaction.editReply({ embeds: [deleted] });

                        const cdnLog = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setTitle("CDN: Upload Deleted")
                            .addFields (
                                { name: "User", value: `${user}` },
                                { name: "File Name", value: file },
                                { name: "Moderator", value: `${interaction.user}` },
                                { name: "Reason", value: `${reason}` }
                            )
                            .setTimestamp()

                        modLogsChannel.send({ embeds: [cdnLog] });
                        return;
                    }

                    if(res.data.code === "NO_FILE_FOUND") {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} That file does not exist!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }
                }

                // if(interaction.options.getSubcommand() === "delete-nsfw") {
                //     const file = interaction.options.getString("file");

                //     const res = await cdn.deleteNSFW(client.token, file, user.id);

                //     if(res.status === 204) {
                //         const deleted = new Discord.EmbedBuilder()
                //             .setColor(client.config_embeds.default)
                //             .setDescription(`${emoji.successful} The file has been deleted from the CDN.`)

                //         await interaction.editReply({ embeds: [deleted] });

                //         const cdnLog = new Discord.EmbedBuilder()
                //             .setColor(client.config_embeds.default)
                //             .setTitle("CDN: NSFW Upload Deleted")
                //             .addFields (
                //                 { name: "User", value: `${user}` },
                //                 { name: "File Name", value: file },
                //                 { name: "Moderator", value: `${interaction.user}` }
                //             )
                //             .setTimestamp()

                //         modLogsChannel.send({ embeds: [cdnLog] });
                //         return;
                //     }

                //     if(res.data.code === "NO_FILE_FOUND") {
                //         const error = new Discord.EmbedBuilder()
                //             .setColor(client.config_embeds.error)
                //             .setDescription(`${emoji.error} That file does not exist!`)

                //         await interaction.editReply({ embeds: [error], ephemeral: true });
                //         return;
                //     }
                // }
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}