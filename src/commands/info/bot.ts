import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, GuildMember } from "discord.js";

import { emojis as emoji } from "../../config";

import BlockedMessage from "../../models/BlockedMessage";
import GitHubUser from "../../models/GitHubUser";
import Message from "../../models/Message";
import User from "../../models/User";

export = {
    name: "bot",
    description: "Different information about the bot.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient & any, Discord: any) {
        try {
            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${client.user.id}` })
                .setDescription("A Discord bot which connects many servers together using a text channel!")
                .addFields (
                    { name: "📈 Version", value: "2.4.2", inline: true },
                    { name: "🟢 Online Since", value: `<t:${(Date.now() - client.uptime).toString().slice(0, -3)}:f> (<t:${(Date.now() - client.uptime).toString().slice(0, -3)}:R>)`, inline: true }
                )

            const developers = await User.find({ dev: true });
            const moderators = await User.find({ mod: true });
            const verified = await User.find({ verified: true });
            const donators = await User.find({ donator: true });

            const githubUsers = await GitHubUser.find();

            const messages = await Message.find();
            const blockedMessages = await BlockedMessage.find();

            const guild = await client.guilds.fetch(client.config_main.ownerGuild);
            const members = await guild.members.fetch();
            const boosters = members.filter((member: GuildMember) => member.premiumSinceTimestamp);

            const stat_guilds = `🗄️ ${client.guilds.cache.size} Guild${client.guilds.cache.size === 1 ? "" : "s"}`;
            const stat_users = `👤 ${client.users.cache.size} User${client.users.cache.size === 1 ? "" : "s"}`;

            const stat_developers = `💻 ${developers.length} Developer${developers.length === 1 ? "" : "s"}`;
            const stat_moderators = `🔨 ${moderators.length} Moderator${moderators.length === 1 ? "" : "s"}`;
            const stat_donators = `💸 ${donators.length} Donator${donators.length === 1 ? "" : "s"}`;
            const stat_verified = `✅ ${verified.length} Verified User${verified.length === 1 ? "" : "s"}`;
            const stat_supporters = `💖 ${boosters.size} Supporter${boosters.size === 1 ? "" : "s"}`;

            const stat_github = `${emoji.github} ${githubUsers.length}`;

            const stat_messages = `💬 ${messages.length} Message${messages.length === 1 ? "" : "s"}`;
            const stat_blocked_messages = `⛔ ${blockedMessages.length} Blocked Message${messages.length === 1 ? "" : "s"}`;

            const statistics = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Statistics")
                .addFields (
                    { name: "🤖 Bot", value: `${stat_guilds}\n${stat_users}`, inline: true },
                    { name: "🎭 Roles", value: `${stat_developers}\n${stat_moderators}\n${stat_donators}\n${stat_verified}\n${stat_supporters}`, inline: true },
                    { name: "🔗 Linked Accounts", value: `${stat_github}`, inline: true },
                    { name: "🌐 Global Chat", value: `${stat_messages}\n${stat_blocked_messages}`, inline: true }
                )

            const buttons = new Discord.ActionRowBuilder()
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
                        .setURL("https://discord.gg/globalchat"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🗳️")
                        .setLabel("Vote")
                        .setURL("https://wdh.gg/gc-vote")
                )

            await interaction.editReply({ embeds: [info, statistics], components: [buttons] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
