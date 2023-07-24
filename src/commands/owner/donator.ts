import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

import User from "../../models/User";

const command: Command = {
    name: "donator",
    description: "Manage the donator role.",
    options: [
        {
            type: 1,
            name: "add",
            description: "[OWNER ONLY] Add a user to the donator role.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to add.",
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "remove",
            description: "[OWNER ONLY] Remove a user from the donator role.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to remove.",
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles(["owner"]),
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);
            const user = interaction.options.getUser("user");

            if(interaction.options.getSubcommand() === "add") {
                if(user.bot) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You cannot make a bot a donator!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const userData = await User.findOne({ _id: user.id });

                if(userData?.donator) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is already a donator!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                if(!userData) {
                    new User({ _id: user.id, donator: true }).save();
                } else {
                    await User.findOneAndUpdate({ _id: user.id }, { donator: true });
                }

                const guild = await client.guilds.fetch(client.config_main.primaryGuild);

                const member = await guild.members.cache.get(user.id);
                const role = await guild.roles.cache.get(client.config_roles.donator);

                if(member) member.roles.add(role);

                const added = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} has been added to the donator role.`)

                await interaction.editReply({ embeds: [added] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Role Added")
                    .addFields (
                        { name: "🎭 Role", value: "💸 Donator" },
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }

            if(interaction.options.getSubcommand() === "remove") {
                if(!await User.exists({ _id: user.id, donator: true })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is not a donator!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await User.findOneAndUpdate({ _id: user.id }, { donator: false });

                const guild = await client.guilds.fetch(client.config_main.primaryGuild);

                const member = await guild.members.cache.get(user.id);
                const role = await guild.roles.cache.get(client.config_roles.donator);

                if(member) member.roles.remove(role);

                const removed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} has been removed from the donator role.`)

                await interaction.editReply({ embeds: [removed] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Role Removed")
                    .addFields (
                        { name: "🎭 Role", value: "💸 Donator" },
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
