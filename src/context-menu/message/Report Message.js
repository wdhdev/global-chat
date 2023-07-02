const assignRoles = require("../../util/roles/assign");
const emoji = require("../../config.json").emojis;

const messageSchema = require("../../models/messageSchema");

module.exports = {
	name: "Report Message",
    type: 3,
    botPermissions: [],
    cooldown: 3,
    enabled: true,
    hidden: false,
	async execute(interaction, client, Discord) {
        try {
            const message = interaction.targetMessage;

            if(!await messageSchema.exists({ messages: message.url })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} No message was found with that ID!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await messageSchema.findOne({ messages: message.url });
            const reportChannel = client.channels.cache.get(client.config_channels.reports);

            try {
                const report = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Report")
                    .addFields (
                        { name: "👤 User", value: `<@${data.user}>` },
                        { name: "💬 Message", value: `${data._id}` }
                    )
                    .setTimestamp()

                const actions = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId(`report-ban-${data.user}`)
                            .setEmoji("🔨")
                            .setLabel("Ban"),

                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId(`delete-message-${data._id}`)
                            .setEmoji("🗑️")
                            .setLabel("Delete Message")
                    )

                const msgData = await messageSchema.findOne({ messages: message.url });

                let user = null;

                try {
                    user = await client.users.fetch(msgData.user);
                } catch {}

                const messageEmbed = new Discord.EmbedBuilder()
                    .setAuthor({ name: user.tag.endsWith("#0") ? `@${user.username}` : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` })
                    .setTitle("Message")
                    .setTimestamp(new Date(Number((BigInt(msgData._id) >> 22n) + 1420070400000n)))

                await assignRoles(user, client, messageEmbed);

                if(msgData.content) messageEmbed.setDescription(msgData.content);
                if(msgData.attachment) messageEmbed.setImage(msgData.attachment);

                reportChannel.send({ embeds: [report, messageEmbed], components: [actions] });
            } catch(err) {
                client.logContextError(err, interaction, Discord);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} An error occurred while submitting the report.`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const submitted = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.successful} Your report has been submitted.`)

            await interaction.editReply({ embeds: [submitted], ephemeral: true });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}
