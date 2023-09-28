import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { createLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import User from "../../models/User";

const command: Command = {
    name: "immunity",
    description: "Manage immunity to moderator commands.",
    options: [
        {
            type: 1,
            name: "add",
            description: "[OWNER ONLY] Make someone immune to moderator commands.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to get immunity.",
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "remove",
            description: "[OWNER ONLY] Remove someone's immunity to moderator commands.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to remove immunity from.",
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["owner"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: typeof import("discord.js")) {
        try {
            const user = interaction.options.getUser("user");
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            if(interaction.options.getSubcommand() === "add") {
                if(user.bot) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You cannot give a bot immunity!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const userData = await User.findOne({ _id: user.id });

                if(userData?.immune) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is already has immunity!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                if(!userData) {
                    await new User({ _id: user.id, immune: true }).save();
                } else {
                    await User.findOneAndUpdate({ _id: user.id }, { immune: true });
                }

                await createLog(user.id, null, "immunityAdd", null, interaction.user.id);

                const added = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} has recieved immunity to moderator commands.`)

                await interaction.editReply({ embeds: [added] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Immunity Added")
                    .addFields (
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }

            if(interaction.options.getSubcommand() === "remove") {
                if(!await User.exists({ _id: user.id, immune: true })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is does not have immunity!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await User.findOneAndUpdate({ _id: user.id }, { immune: false });

                await createLog(user.id, null, "immunityRemove", null, interaction.user.id);

                const removed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} is no longer immune to moderator commands.`)

                await interaction.editReply({ embeds: [removed] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Immunity Removed")
                    .addFields (
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
