const devSchema = require("../../models/devSchema");
const messageSchema = require("../../models/messageSchema");
const modSchema = require("../../models/modSchema");
const verifiedSchema = require("../../models/verifiedSchema");

module.exports = {
    name: "statistics",
    startsWith: false,
    requiredRoles: [],
    async execute(interaction, client, Discord) {
        try {
            await interaction.deferReply({ ephemeral: true });

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

            const statistics = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "🤖 Bot", value: `${stat_guilds}\n${stat_users}` },
                    { name: "🎭 Roles", value: `${stat_developers}\n${stat_moderators}\n${stat_verified}\n${stat_supporters}` },
                    { name: "🌐 Global Chat", value: `${stat_messages}\n${stat_images}` }
                )

            await interaction.editReply({ embeds: [statistics] });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
