import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import getRoles from "../../functions/roles/get";

import BlockedMessage from "../../models/BlockedMessage";
import GitHubUser from "../../models/GitHubUser";
import Message from "../../models/Message";

const command: Command = {
    name: "me",
    description: "Get Global Chat's information about you.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles([]),
    cooldown: 0,
    enabled: true,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            // Roles
            const role = await getRoles(interaction.user.id, client);

            const roles = [];

            if(role.owner) roles.push("👑 Owner");
            if(role.dev) roles.push("💻 Developer");
            if(role.mod) roles.push("🔨 Moderator");
            if(role.donator) roles.push("💸 Donator");
            if(role.verified) roles.push("✅ Verified");
            if(role.supporter) roles.push("💖 Supporter");
            if(role.immunity) roles.push("😇 Immunity");

            // Linked Accounts
            const accounts = [];

            const github = await GitHubUser.findOne({ _id: interaction.user.id });

            if(github) {
                accounts.push(`${emoji.github} GitHub\n${emoji.reply} <t:${github.linked.toString().slice(0, -3)}>`);
            }

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

            if(accounts.length || roles.length || blocked || images || messages) {
                userInfo.setTitle("User Information");
                userInfo.setDescription(null);
            }

            if(roles.length) userInfo.addFields({ name: "🎭 Roles", value: roles.join("\n"), inline: true });
            if(blocked || images || messages) userInfo.addFields({ name: "📊 Statistics", value: `${stats.messages}\n${stats.images}\n${stats.blocked}`, inline: true });
            if(accounts.length) userInfo.addFields({ name: "🔗 Linked Accounts", value: accounts.join("\n"), inline: true });

            await interaction.editReply({ embeds: [userInfo] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
