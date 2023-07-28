import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";

import { emojis as emoji } from "../../config";

import Guild from "../../models/Guild";

const command: Command = {
    name: "blocked",
    description: "Get a list of all the guild's blocked users.",
    options: [],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    allowWhileBanned: false,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const data = await Guild.findOne({ _id: interaction.guild.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This guild is not registered!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(!data.blockedUsers.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This guild has not blocked any users!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const blocked = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.red)
                .setTitle("⛔ Blocked Users")
                .setDescription(`<@${data.blockedUsers.join(">, <@")}>`)

            await interaction.editReply({ embeds: [blocked] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
