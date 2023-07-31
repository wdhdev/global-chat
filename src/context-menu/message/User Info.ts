import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import { MessageContextMenuCommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import { getInfractions } from "../../classes/Infraction";
import { getRoleArray, Role, getRoleWithEmoji } from "../../classes/Roles";
import getRoles from "../../functions/roles/get";
import { noMessage } from "../../util/embeds";

import BannedUser from "../../models/BannedUser";
import BlockedMessage from "../../models/BlockedMessage";
import GitHubUser from "../../models/GitHubUser";
import Message from "../../models/Message";

const command: ContextCommand = {
    name: "User Info",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: MessageContextMenuCommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const message = interaction.targetMessage;
            const messageData = await Message.findOne({ messages: message.url });

            if(!messageData) return await interaction.editReply({ embeds: [noMessage] });

            const user = await client.users.fetch(messageData.user);

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

            // Linked Accounts
            const accounts = [];

            const github = await GitHubUser.findOne({ _id: user.id });

            if(github) accounts.push(`${emoji.github} GitHub\n${emoji.reply} <t:${github.linked.toString().slice(0, -3)}>`);

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
            if(accounts.length) userInfo.addFields({ name: "🔗 Linked Accounts", value: accounts.join("\n"), inline: true });

            await interaction.editReply({ embeds: [userInfo] });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

export = command;
