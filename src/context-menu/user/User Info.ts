import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import { UserContextMenuCommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import { getInfractions } from "../../classes/Infraction";
import { getRoleArray, Role, getRoleWithEmoji } from "../../classes/Roles";
import getRoles from "../../functions/roles/get";

import BannedUser from "../../models/BannedUser";
import BlockedMessage from "../../models/BlockedMessage";
import Message from "../../models/Message";

const command: ContextCommand = {
    name: "User Info",
    type: 2,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: UserContextMenuCommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const user = interaction.targetUser;

            // Infractions
            const infractions = await getInfractions(user.id, 5, false);

            // Banned
            let banned = false;

            const banInfo = await BannedUser.findOne({ _id: user.id });

            if(banInfo) banned = true;

            const banData = banned ? `🕰️ <t:${banInfo.timestamp.slice(0, -3)}> (<t:${banInfo.timestamp.slice(0, -3)}:R>)\n📜 ${banInfo.allowAppeal ? "Appealable" : "Not Appealable"}\n❓ ${banInfo.reason}\n🔨 <@${banInfo.mod}>` : null;

            // Roles
            const roleArray: Role[] = getRoleArray(await getRoles(user.id, client));
            const roles = roleArray.map(role => getRoleWithEmoji(role));

            // Statistics
            const blocked = (await BlockedMessage.find({ user: user.id })).length;
            const images = (await Message.find({ user: user.id, attachment: { $ne: null } })).length;
            const messages = (await Message.find({ user: user.id })).length;

            const stats = {
                blocked: `⛔ ${blocked} ${blocked === 1 ? "Blocked Message" : "Blocked Messages"}`,
                images: `📷 ${images} ${images === 1 ? "Image" : "Images"}`,
                messages: `💬 ${messages} ${messages === 1 ? "Message" : "Messages"}`
            }

            const userInfo = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` })
                .addFields (
                    { name: `${emoji.discord} Account Info`, value: `**ID**: \`${user.id}\`\n**Created**: <t:${user.createdTimestamp.toString().slice(0, -3)}> (<t:${user.createdTimestamp.toString().slice(0, -3)}:R>)` }
                )

            if(infractions.length) userInfo.setDescription(infractions.join("\n"));
            if(banned) userInfo.addFields({ name: "🔨 Ban Info", value: banData, inline: true });
            if(roles.length) userInfo.addFields({ name: "🎭 Roles", value: roles.join("\n"), inline: true });
            if(blocked || images || messages) userInfo.addFields({ name: "📊 Statistics", value: `${stats.messages}\n${stats.images}\n${stats.blocked}`, inline: true });

            await interaction.editReply({ embeds: [userInfo] });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

export = command;
