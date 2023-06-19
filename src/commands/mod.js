const cdnDelete = require("../util/cdn/delete");
const cdnDeleteNSFW = require("../util/cdn/delete-nsfw");
const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");

module.exports = {
	name: "mod",
	description: "Moderator Commands",
    options: [
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

            if(!mod && !dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(interaction.options.getSubcommandGroup() === "cdn") {
                const user = interaction.options.getUser("user");

                if(interaction.options.getSubcommand() === "delete") {
                    const file = interaction.options.getString("file");
                    const reason = interaction.options.getString("reason");

                    const res = await cdnDelete(client.token, file, user.id);

                    if(res.status === 204) {
                        const deleted = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} The file has been deleted from the CDN.`)

                        await interaction.editReply({ embeds: [deleted] });

                        const cdnLog = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                            .setTitle("🗑️ CDN: Upload Deleted")
                            .addFields (
                                { name: "👤 User", value: `${user}` },
                                { name: "📄 File", value: file },
                                { name: "❓ Reason", value: `${reason}` }
                                
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

                //     const res = await cdnDeleteNSFW(client.token, file, user.id);

                //     if(res.status === 204) {
                //         const deleted = new Discord.EmbedBuilder()
                //             .setColor(client.config_embeds.default)
                //             .setDescription(`${emoji.successful} The file has been deleted from the CDN.`)

                //         await interaction.editReply({ embeds: [deleted] });

                //         const cdnLog = new Discord.EmbedBuilder()
                //             .setColor(client.config_embeds.default)
                //             .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                //             .setTitle("🗑️ CDN: NSFW Upload Deleted")
                //             .addFields (
                //                 { name: "👤 User", value: `${user}` },
                //                 { name: "📄 File", value: file }
                //                 
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