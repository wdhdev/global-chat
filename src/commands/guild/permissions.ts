import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";

import { emojis as emoji } from "../../config";

const command: Command = {
    name: "permissions",
    description: "Check if the bot has the required permissions.",
    options: [],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 20,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient, Discord: any) {
        try {
            const permissions: any = {
                AttachFiles: "Attach Files",
                EmbedLinks: "Embed Links",
                ManageMessages: "Manage Messages",
                ManageWebhooks: "Manage Webhooks",
                ReadMessageHistory: "Read Message History",
                SendMessages: "Send Messages",
                UseExternalEmojis: "Use External Emojis",
                ViewChannel: "Read Messages/View Channels"
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

            await interaction.editReply({ embeds: [permissionsEmbed], components: disallowedPerms.length ? [inviteButton] : [] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
