import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { getRoleArray, Role, getRoleWithEmoji } from "../../classes/Roles";
import getRoles from "../../functions/roles/get";

import BlockedMessage from "../../models/BlockedMessage";
import Message from "../../models/Message";

const command: Command = {
    name: "me",
    description: "Get Global Chat's information about you.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: true,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            // Roles
            const roleArray: Role[] = getRoleArray(await getRoles(interaction.user.id, client));
            const roles = roleArray.map(role => getRoleWithEmoji(role));

            // Statistics
            const blocked = (await BlockedMessage.find({ user: interaction.user.id })).length;
            const images = (await Message.find({ user: interaction.user.id, attachment: { $ne: null } })).length;
            const messages = (await Message.find({ user: interaction.user.id })).length;

            const stats = {
                blocked: `⛔ ${blocked} ${blocked === 1 ? "Blocked Message" : "Blocked Messages"}`,
                images: `📷 ${images} ${images === 1 ? "Image" : "Images"}`,
                messages: `💬 ${messages} ${messages === 1 ? "Message" : "Messages"}`
            }

            const userInfo = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription("*There is no information available about you.*")

            if(roles.length || blocked || images || messages) {
                userInfo.setTitle("User Information");
                userInfo.setDescription(null);
            }

            if(roles.length) userInfo.addFields({ name: "🎭 Roles", value: roles.join("\n"), inline: true });
            if(blocked || images || messages) userInfo.addFields({ name: "📊 Statistics", value: `${stats.messages}\n${stats.images}\n${stats.blocked}`, inline: true });

            await interaction.editReply({ embeds: [userInfo] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
