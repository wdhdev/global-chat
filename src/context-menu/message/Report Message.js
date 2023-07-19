const emoji = require("../../config").emojis;

const Message = require("../../models/Message");

module.exports = {
    name: "Report Message",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const message = interaction.targetMessage;

            const data = await Message.findOne({ messages: message.url });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} No message was found with that ID!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(data.user === interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You can't report yourself!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const reportChannel = client.channels.cache.get(client.config_channels.reports);

            try {
                const report = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
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

                let user = null;

                try {
                    user = await client.users.fetch(data.user);
                } catch {}

                const messageEmbed = new Discord.EmbedBuilder()
                    .setTimestamp(new Date(Number((BigInt(data._id) >> 22n) + 1420070400000n)))

                if(user) messageEmbed.setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
                if(data.content) messageEmbed.setDescription(data.content);

                reportChannel.send({ content: `<@&${client.config_roles.mod}>`, embeds: [report, messageEmbed], components: [actions] });
            } catch(err) {
                client.logError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} An error occurred while submitting the report.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const submitted = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your report has been submitted.`)

            await interaction.editReply({ embeds: [submitted] });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}
