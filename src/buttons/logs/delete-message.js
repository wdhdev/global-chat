const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");
const messageSchema = require("../../models/messageSchema");
const modSchema = require("../../models/modSchema");

module.exports = {
    name: "delete-message",
    startsWith: true,
    async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });

            if(!mod && !dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const id = interaction.customId.replace("delete-message-", "");
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            if(!await messageSchema.exists({ _id: id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} No message was found with that ID!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
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
                        await client.channels.fetch(info[1]).then(async channel => {
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
                await interaction.deferUpdate();

                interaction.message.components[0].components[1].data.disabled = true;

                await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.red)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle(`🗑️ Message Deleted`)
                    .addFields (
                        { name: "📄 Result", value: `Deleted ${deleted} of ${total} messages.` }
                    )
                    .setTimestamp()

                interaction.message.embeds.push(result);

                await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle(`🗑️ Message Deleted`)
                    .addFields (
                        { name: "💬 Message", value: `${id}` },
                        { name: "📄 Result", value: `Deleted ${deleted} of ${total} messages.` }
                    )
                    .setTimestamp()

                modLogsChannel.send({ embeds: [log] });
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
