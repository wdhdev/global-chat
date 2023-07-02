const bot = require("../../../package.json");
const moment = require("moment");

const devSchema = require("../../models/devSchema");
const messageSchema = require("../../models/messageSchema");
const modSchema = require("../../models/modSchema");
const verifiedSchema = require("../../models/verifiedSchema");

module.exports = {
    name: "bot",
    description: "Different information about the bot.",
    options: [
        {
            type: 1,
            name: "info",
            description: "Get information about the bot.",
            options: []
        },

        {
            type: 1,
            name: "stats",
            description: "Get statistics about the bot.",
            options: []
        },

        {
            type: 1,
            name: "uptime",
            description: "Get the bot's uptime.",
            options: []
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            if(interaction.options.getSubcommand() === "info") {
                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                    .setDescription(bot.description)
                    .addFields (
                        { name: "📈 Version", value: bot.version }
                    )

                await interaction.editReply({ embeds: [info] });
                return;
            }

            if(interaction.options.getSubcommand() === "stats") {
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
                    .setTitle("📊 Statistics")
                    .addFields (
                        { name: "🤖 Bot", value: `${stat_guilds}\n${stat_users}`, inline: true },
                        { name: "🎭 Roles", value: `${stat_developers}\n${stat_moderators}\n${stat_verified}\n${stat_supporters}`, inline: true },
                        { name: "🌐 Global Chat", value: `${stat_messages}\n${stat_images}`, inline: true }
                    )

                await interaction.editReply({ embeds: [stats] });
                return;
            }

            if(interaction.options.getSubcommand() === "uptime") {
                const uptime = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
				    .setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                    .setTitle("Online Since")
                    .setDescription(`<t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:f> **|** <t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:R>`)

                await interaction.editReply({ embeds: [uptime] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
