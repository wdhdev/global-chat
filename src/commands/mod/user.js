const getRoles = require("../../util/roles/get");

const BannedUser = require("../../models/BannedUser");
const BlockedMessage = require("../../models/BlockedMessage");
const Message = require("../../models/Message");
const User = require("../../models/User");

module.exports = {
    name: "user",
    description: "[MODERATOR ONLY] Get information about a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's information to get.",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    hidden: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const user = interaction.options.getUser("user");

            // Roles
            const role = await getRoles(user.id, client);

            const roles = [];

            if(role.owner) roles.push("👑 Owner");
            if(role.dev) roles.push("💻 Developer");
            if(role.mod) roles.push("🔨 Moderator");
            if(role.verified) roles.push("✅ Verified");
            if(role.donator) roles.push("💸 Donator");
            if(role.supporter) roles.push("💖 Supporter");

            // Immunity
            const immune = await User.exists({ _id: user.id, immune: true });

            // Banned
            let banned = false;

            const banInfo = await BannedUser.findOne({ _id: user.id });

            if(banInfo) banned = true;

            const banData = `${banned ? "" : "❌"}\n${banned && banInfo.timestamp ? `🕰️ <t:${banInfo.timestamp.slice(0, -3)}> (<t:${banInfo.timestamp.slice(0, -3)}:R>)` : ""}\n${banned ? `📜 ${banInfo.allowAppeal ? "Appealable" : "Not Appealable"}` : ""}\n${banned && banInfo.reason ? `❓ ${banInfo.reason}` : ""}\n${banned && banInfo.mod ? `🔨 <@${banInfo.mod}>` : ""}`;

            // Stats
            const blocked = (await BlockedMessage.find({ user: user.id })).length;
            const images = (await Message.find({ user: user.id, attachment: { $ne: null } })).length;
            const messages = (await Message.find({ user: user.id })).length;

            const stats = {
                "blocked": `⛔ ${blocked} ${blocked === 1 ? "Blocked Message" : "Blocked Messages"}`,
                "images": `📷 ${images} ${images === 1 ? "Image" : "Images"}`,
                "messages": `💬 ${messages} ${messages === 1 ? "Message" : "Messages"}`
            }

            const userInfo = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` })
                .setTitle("User Information")
                .addFields (
                    { name: "Roles", value: roles.join("\n") || "*None*" },
                    { name: "Immunity", value: immune ? "✅" : "❌" },
                    { name: "Banned", value: banData },
                    { name: "Statistics", value: `${stats.messages}\n${stats.images}\n${stats.blocked}` }
                )

            await interaction.editReply({ embeds: [userInfo] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
