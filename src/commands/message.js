const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");
const messageSchema = require("../models/messageSchema");
const modSchema = require("../models/modSchema");

module.exports = {
    name: "message",
    description: "Manage messages.",
    options: [
        {
            type: 1,
            name: "delete",
            description: "Delete a global chat message.",
            options: [
                {
                    type: 3,
                    name: "id",
                    description: "The ID of the message to delete.",
                    min_length: 17,
                    max_length: 19,
                    required: true
                }
            ]
        },
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
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

            if(interaction.options.getSubcommand() === "delete") {
                const id = interaction.options.getString("id");

                if(!await messageSchema.exists({ _id: id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} No message was found with that ID!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const data = await messageSchema.findOne({ _id: id });

                const total = data.messages.length;
                let deleted = 0;

                const promises = [];

                for(const message of data.messages) {
                    promises.push(new Promise(async resolve => {
                        const info = message.replace("https://discord.com/channels/", "").split("/");;

                        try {
                            client.channels.fetch(info[1]).then(async channel => {
                                await channel.messages.delete(info[2]);
                            })

                            deleted += 1;
                            resolve(true);
                        } catch {
                            resolve(false);
                        }
                    }))
                }

                Promise.all(promises).then(async () => {
                    const result = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle(`🗑️ Deleted Message: ${id}`)
                        .addFields (
                            { name: "💬 Messages", value: `${total}` },
                            { name: "✅ Deleted", value: `${deleted}` },
                            { name: "❌ Couldn't Delete", value: `${total - deleted}` }
                        )
                        .setTimestamp()

                    await interaction.editReply({ embeds: [result] });

                    const cdnLog = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("🗑️ Message Deleted")
                        .addFields (
                            { name: "👤 User", value: `<@${data.id}>` },
                            { name: "💬 Message", value: `${data._id}` },
                            { name: "📩 Sent Messages", value: `${total}` },
                            { name: "✅ Deleted", value: `${deleted}` },
                            { name: "❌ Couldn't Delete", value: `${total - deleted}` },
                            { name: "🔨 Moderator", value: `${interaction.user}` }
                        )
                        .setTimestamp()

                    modLogsChannel.send({ embeds: [cdnLog] });
                })

                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
