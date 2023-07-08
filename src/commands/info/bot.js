const bot = require("../../../package.json");
const moment = require("moment");

module.exports = {
    name: "bot",
    description: "Different information about the bot.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                .setDescription(bot.description)
                .addFields (
                    { name: "📈 Version", value: bot.version, inline: true },
                    { name: "🟢 Online Since", value: `<t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:f> (<t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:R>)`, inline: true }
                )

            const row_1 = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setCustomId("statistics")
                        .setEmoji("📊")
                        .setLabel("Statistics"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setCustomId("credits")
                        .setEmoji("✨")
                        .setLabel("Credits")
                )

            const row_2 = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🔗")
                        .setLabel("Invite")
                        .setURL("https://wdh.gg/globalchat"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🤝")
                        .setLabel("Support")
                        .setURL("https://discord.gg/globalchat"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("📜")
                        .setLabel("Terms")
                        .setURL("https://wdh.gg/gc-terms")
                )

            await interaction.editReply({ embeds: [info], components: [row_1, row_2] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
