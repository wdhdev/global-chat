const bot = require("../../../package.json");
const moment = require("moment");

const devSchema = require("../../models/devSchema");
const messageSchema = require("../../models/messageSchema");
const modSchema = require("../../models/modSchema");
const verifiedSchema = require("../../models/verifiedSchema");

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
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                .setDescription(bot.description)
                .addFields (
                    { name: "📈 Version", value: bot.version, inline: true },
                    { name: "🟢 Online Since", value: `<t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:f> (<t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:R>)`, inline: true }
                )

            const developers = await devSchema.find();
            const moderators = await modSchema.find();
            const verifiedUsers = await verifiedSchema.find();
            const messages = await messageSchema.find();
            const images = await messageSchema.find({ attachment: { $ne: null } });

            const guild = await client.guilds.fetch(client.config_default.guild);
            const members = await guild.members.fetch();
            const boosters = members.filter(member => member.premiumSinceTimestamp);

            const stat_guilds = `🗄️ ${client.guilds.cache.size} Guild${client.guilds.cache.size === 1 ? "" : "s"}`;
            const stat_users = `👤 ${client.users.cache.size} User${client.users.cache.size === 1 ? "" : "s"}`;

            const stat_developers = `💻 ${developers.length} Developer${developers.length === 1 ? "" : "s"}`;
            const stat_moderators = `🔨 ${moderators.length} Moderator${moderators.length === 1 ? "" : "s"}`;
            const stat_verified = `✅ ${verifiedUsers.length} Verified User${verifiedUsers.length === 1 ? "" : "s"}`;
            const stat_supporters = `💖 ${boosters.size} Supporter${boosters.size === 1 ? "" : "s"}`;

            const stat_messages = `💬 ${messages.length} Message${messages.length === 1 ? "" : "s"}`;
            const stat_images = `🖼️ ${images.length} Image${images.length === 1 ? "" : "s"}`;

            const stats = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Statistics")
                .addFields (
                    { name: "🤖 Bot", value: `${stat_guilds}\n${stat_users}`, inline: true },
                    { name: "🎭 Roles", value: `${stat_developers}\n${stat_moderators}\n${stat_verified}\n${stat_supporters}`, inline: true },
                    { name: "🌐 Global Chat", value: `${stat_messages}\n${stat_images}`, inline: true }
                )

            const row_1 = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🔗")
                        .setLabel("Invite")
                        .setURL("https://wdh.gg/globalchat"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🆘")
                        .setLabel("Support")
                        .setURL("https://discord.gg/globalchat")
                )

            const row_2 = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("📜")
                        .setLabel("Terms and Conditions")
                        .setURL("https://wdh.gg/gc-terms")
                )

            await interaction.editReply({ embeds: [info, stats], components: [row_1, row_2] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
