const emoji = require("../config.json").emojis;
const getRoles = require("../util/roles/get");

const bannedUserSchema = require("../models/bannedUserSchema");
const blockedSchema = require("../models/blockedSchema");
const devSchema = require("../models/devSchema");
const messageSchema = require("../models/messageSchema");
const modSchema = require("../models/modSchema");

module.exports = {
    name: "user",
    description: "Get information about a user.",
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
    cooldown: 0,
    enabled: true,
    hidden: true,
    async execute(interaction, client, Discord) {
        try {
            const user = interaction.options.getUser("user");

            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });

            check:
            if(mod || dev) {
                break check;
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            // Banned
            let banned = false;

            const banInfo = await bannedUserSchema.findOne({ _id: user.id });

            if(banInfo) banned = true;

            const banData = `${banned && banInfo.timestamp ? `${emoji.reply} 🕰️ <t:${banInfo.timestamp.slice(0, -3)}>` : ""}\n${banned ? `${emoji.reply} 📜 ${banInfo.allowAppeal ? "Appealable" : "Not Appealable"}` : ""}\n${banned && banInfo.reason ? `${emoji.reply} ❓ ${banInfo.reason}` : ""}\n${banned && banInfo.mod ? `${emoji.reply} 🔨 <@${banInfo.mod}>` : ""}\n`;

            // Roles
            const role = await getRoles(user, client);

            const roles = [];

            if(role.dev) roles.push("💻 Developer");
            if(role.mod) roles.push("🔨 Moderator");
            if(role.verified) roles.push("✅ Verified");
            if(role.supporter) roles.push("❤️ Supporter");

            // Stats
            const blocked = (await blockedSchema.find({ user: user.id })).length;
            const images = (await messageSchema.find({ user: user.id, attachment: { $ne: null } })).length;
            const messages = (await messageSchema.find({ user: user.id })).length;

            const stats = {
                "blocked": `⛔ ${blocked} ${blocked === 1 ? "Blocked Message" : "Blocked Messages"}`,
                "images": `📷 ${images} ${images === 1 ? "Image" : "Images"}`,
                "messages": `💬 ${messages} ${messages === 1 ? "Message" : "Messages"}`
            }

            const userInfo = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? `@${user.username}` : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` })
                .setTitle("User Information")
                .addFields (
                    { name: "Roles", value: roles.join("\n") || "*None*" },
                    { name: "Banned", value: `${banned ? "✅ Yes" : "❌ No"}${banned ? `\n${banData}` : ""}` },
                    { name: "Statistics", value: `${stats.messages}\n${stats.images}\n${stats.blocked}` }
                )

            await interaction.editReply({ embeds: [userInfo] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}