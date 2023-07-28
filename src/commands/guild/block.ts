import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";

import { emojis as emoji } from "../../config";

import Guild from "../../models/Guild";
import User from "../../models/User";

const command: Command = {
    name: "block",
    description: "Block a user's messages sending to this guild.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user to block.",
            required: true
        }
    ],
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
            const user = interaction.options.getUser("user");

            let data = await Guild.findOne({ _id: interaction.guild.id });
            const userData = await User.findOne({ _id: user.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This guild is not registered!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(data.blockedUsers.includes(user.id)) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That user is already blocked!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(userData?.dev || userData?.mod) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot block Global Chat staff!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(user.id === interaction.guild.ownerId) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot block the guild owner!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(user.bot) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot block bots!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(!data.blockedUsers) {
                await Guild.findOneAndUpdate({ _id: interaction.guild.id }, { blockedUsers: [user.id] });
            } else {
                data.blockedUsers.push(user.id);
                await data.save();
            }

            const blocked = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user} has been blocked!`)

            await interaction.editReply({ embeds: [blocked] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
