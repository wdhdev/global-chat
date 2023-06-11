const emoji = require("../config.json").emojis;

module.exports = {
	name: "report",
	description: "Report a user or guild abusing the bot.",
    options: [
        {
            type: 1,
            name: "guild",
            description: "Report a guild abusing the bot.",
            options: [
                {
                    type: 3,
                    name: "guild",
                    description: "The Discord ID (recommended) or invite of the guild you want to report.",
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "The reason to why you want to report this guild.",
                    required: true
                },

                {
                    type: 3,
                    name: "evidence",
                    description: "Evidence of the user abusing the guild.",
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "user",
            description: "Report a user abusing the bot.",
            options: [
                {
                    type: 3,
                    name: "user",
                    description: "The Discord ID (recommended) or username of the user you want to report.",
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "The reason to why you want to report this user.",
                    required: true
                },

                {
                    type: 3,
                    name: "evidence",
                    description: "Evidence of the user abusing the bot.",
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 30,
    enabled: true,
    hidden: false,
	async execute(interaction, client, Discord) {
        try {
            const reportChannel = client.channels.cache.get(client.config_channels.reports);

            if(interaction.options.getSubcommand() === "guild") {
                const guild = interaction.options.getString("guild");
                const reason = interaction.options.getString("reason");
                const evidence = interaction.options.getString("evidence");

                try {
                    const report = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("Guild Report")
                        .addFields (
                            { name: "🗃️ Guild", value: guild },
                            { name: "❓ Reason", value: reason },
                            { name: "📄 Evidence", value: evidence }
                        )

                    reportChannel.send({ content: `<@&${client.config_roles.mod}>`, embeds: [report] });
                } catch(err) {
                    client.logCommandError(err, interaction, Discord);

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
                return;
            }

            if(interaction.options.getSubcommand() === "user") {
                const user = interaction.options.getString("user");
                const reason = interaction.options.getString("reason");
                const evidence = interaction.options.getString("evidence");

                try {
                    const report = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("User Report")
                        .addFields (
                            { name: "👤 User", value: user },
                            { name: "❓ Reason", value: reason },
                            { name: "📄 Evidence", value: evidence }
                        )

                    reportChannel.send({ content: `<@&${client.config_roles.mod}>`, embeds: [report] });
                } catch(err) {
                    client.logCommandError(err, interaction, Discord);

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
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
