const { PermissionFlagsBits } = require("discord.js");

const emoji = require("../config.json").emojis;

module.exports = {
    name: "permissions",
    description: "Check if the bot has the required permissions.",
    options: [],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    cooldown: 60,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            const permissions = {
                ManageWebhooks: "Manage Webhooks",
                ViewChannel: "Read Messages/View Channels",
                SendMessages: "Send Messages",
                ManageMessages: "Manage Messages",
                EmbedLinks: "Embed Links",
                AttachFiles: "Attach Files",
                ReadMessageHistory: "Read Message History",
                UseExternalEmojis: "Use External Emojis"
            }

            const perms = [];
            const disallowedPerms = [];

            for(const perm of Object.keys(permissions)) {
                if(interaction.guild.members.me.permissions.has(perm)) {
                    perms.push(`${emoji.tick} ${permissions[perm]}`);
                } else {
                    perms.push(`${emoji.cross} ${permissions[perm]}`);
                    disallowedPerms.push(`${emoji.cross} ${permissions[perm]}`);
                }
            }

            const permissionsEmbed = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Permissions")
                .setDescription(perms.join("\n"))

            const inviteButton = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setLabel("Invite")
                        .setURL("https://wdh.gg/globalchat")
                )

            if(disallowedPerms.length) return await interaction.editReply({ embeds: [permissionsEmbed], components: [inviteButton] });

            await interaction.editReply({ embeds: [permissionsEmbed] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}