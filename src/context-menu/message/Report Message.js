const emoji = require("../../config.json").emojis;

const Message = require("../../models/Message");

module.exports = {
	name: "Report Message",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
	async execute(interaction, client, Discord) {
        try {
            const message = interaction.targetMessage;

            if(!await Message.exists({ messages: message.url })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} No message was found with that ID!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await Message.findOne({ messages: message.url });
            const reportChannel = client.channels.cache.get(client.config_channels.reports);

            if(data.user === interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You can't report yourself!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            try {
                const report = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
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
                            .setEmoji("🔨"),

                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId(`delete-message-${data._id}`)
                            .setEmoji("🗑️")
                    )

                const msgData = await Message.findOne({ messages: message.url });

                let user = null;

                try {
                    user = await client.users.fetch(msgData.user);
                } catch {}

                const messageEmbed = new Discord.EmbedBuilder()
                    .setTimestamp(new Date(Number((BigInt(msgData._id) >> 22n) + 1420070400000n)))

                if(user) messageEmbed.setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` });

                if(msgData.content) messageEmbed.setDescription(msgData.content);
                if(msgData.attachment) messageEmbed.setImage(msgData.attachment);

                reportChannel.send({ content: `<@&${client.config_roles.mod}>`, embeds: [report, messageEmbed], components: [actions] });
            } catch(err) {
                client.logError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} An error occurred while submitting the report.`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const submitted = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your report has been submitted.`)

            await interaction.editReply({ embeds: [submitted], ephemeral: true });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}
