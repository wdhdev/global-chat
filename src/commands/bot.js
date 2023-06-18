const bot = require("../../package.json");
const moment = require("moment");

const channelSchema = require("../models/channelSchema");
const devSchema = require("../models/devSchema");
const messageSchema = require("../models/messageSchema");
const modSchema = require("../models/modSchema");
const verifiedSchema = require("../models/verifiedSchema");

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
                        { name: "📈 Version", value: bot.version, inline: true },
                        { name: "💻 Developer", value: bot.author, inline: true },
                        { name: "📜 Scripts", value: `${Object.keys(bot.scripts).length}`, inline: true },
                        { name: "📌 Dependencies", value: `${Object.keys(bot.dependencies).length}`, inline: true },
                        { name: "📄 License", value: bot.license, inline: true }
                    )

                await interaction.editReply({ embeds: [info] });
                return;
            }

            if(interaction.options.getSubcommand() === "stats") {
                const registeredGuilds = await channelSchema.find();
                const developers = await devSchema.find();
                const moderators = await modSchema.find();
                const verifiedUsers = await verifiedSchema.find();
                const messages = await messageSchema.find();
                const images = await messageSchema.find({ attachment: { $ne: null } });

                const guild = await client.guilds.fetch(client.config_default.guild);
                const members = await guild.members.fetch();
                const boosters = members.filter(member => member.premiumSinceTimestamp);

                let supporters = 0;

                for(const [userId, guildMember] of boosters) {
                    supporters += 1;
                }

                const stats = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                    .setTitle("📊 Statistics")
                    .addFields (
                        { name: "🗄️ Guilds", value: `${client.guilds.cache.size} (${registeredGuilds.length} registered)`, inline: true },
                        { name: "👤 Users", value: `${client.users.cache.size}`, inline: true },
                        { name: "💻 Developers", value: `${developers.length}`, inline: true },
                        { name: "🔨 Moderators", value: `${moderators.length}`, inline: true },
                        { name: "✅ Verified Users", value: `${verifiedUsers.length}`, inline: true },
                        { name: "💖 Supporters", value: `${supporters}`, inline: true },
                        { name: "💬 Messages", value: `${messages.length}`, inline: true },
                        { name: "🖼️ Images", value: `${images.length}`, inline: true }
                    )

                await interaction.editReply({ embeds: [stats] });
                return;
            }

            if(interaction.options.getSubcommand() === "uptime") {
                let totalSeconds = (client.uptime / 1000);

                const days = Math.floor(totalSeconds / 86400);
                totalSeconds %= 86400; 
                const hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = Math.floor(totalSeconds % 60);

                const uptime_days = days === 1 ? `${days} day` : `${days} days`;
                const uptime_hours = hours === 1 ? `${hours} hour` : `${hours} hours`;
                const uptime_minutes = minutes === 1 ? `${minutes} minute` : `${minutes} minutes`;
                const uptime_seconds = seconds === 1 ? `${seconds} second` : `${seconds} seconds`;

                const uptime = `${uptime_days}, ${uptime_hours}, ${uptime_minutes}, ${uptime_seconds}`;

                const uptimeInfo = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
				    .setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                    .setTitle("Uptime")
                    .setDescription(`${uptime}\n**Timestamp**: <t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:R>`)

                await interaction.editReply({ embeds: [uptimeInfo] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
