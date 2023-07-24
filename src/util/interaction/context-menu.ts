import ExtendedClient from "../../classes/ExtendedClient";
import { ContextMenuCommandInteraction } from "discord.js";

import ContextCommand from "../../classes/ContextCommand";

import { emojis as emoji } from "../../config";
import getRoles from "../../functions/roles/get";
import { noPermissionCommand } from "../embeds";

import BannedUser from "../../models/BannedUser";

const cooldowns = new Map();

export = async (client: ExtendedClient, Discord: any, interaction: ContextMenuCommandInteraction) => {
    try {
        const command: ContextCommand = client.contextCommands.get(`${interaction.commandType}-${interaction.commandName}`);

        if(!command) return;

        if(await BannedUser.exists({ _id: interaction.user.id }) && !command.allowWhileBanned) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.cross} You are banned from using the bot!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const requiredRoles: Array<string> = command.requiredRoles.get();
        const userRoles: any = await getRoles(interaction.user.id, client);

        if(requiredRoles.length) {
            const hasRoles = [];

            for(const role of requiredRoles) {
                if(userRoles[role]) hasRoles.push(role);
            }

            if(requiredRoles.length !== hasRoles.length) return await interaction.reply({ embeds: [noPermissionCommand], ephemeral: true });
        }

        if(!command.enabled) {
            const disabled = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.cross} This command has been disabled!`)

            await interaction.reply({ embeds: [disabled], ephemeral: true });
            return;
        }

        const validPermissions = client.validPermissions;

        if(command.botPermissions.length) {
            const invalidPerms = [];

            for(const perm of command.botPermissions as any) {
                if(!validPermissions.includes(perm)) return;

                if(!interaction.guild.members.me.permissions.has(perm)) invalidPerms.push(perm);
            }

            if(invalidPerms.length) {
                const permError = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`I am missing these permissions: \`${invalidPerms.join("\`, \`")}\``)

                await interaction.reply({ embeds: [permError], ephemeral: true });
                return;
            }
        }

        command.deferReply ? command.ephemeral ? await interaction.deferReply({ ephemeral: true }) : await interaction.deferReply() : null;

        if(interaction.user.id === client.config_main.owner) {
            try {
                await command.execute(interaction, client, Discord);
                return;
            } catch(err) {
                client.logError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There was an error while executing that command!`)

                command.deferReply ? await interaction.editReply({ embeds: [error] }) : await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }
        }

        if(!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());

        const currentTime = Date.now();
        const timeStamps = cooldowns.get(command.name);
        const cooldownAmount = command.cooldown * 1000;

        if(timeStamps.has(interaction.user.id)) {
            const expirationTime = timeStamps.get(interaction.user.id) + cooldownAmount;

            if(currentTime < expirationTime) {
                const timeLeft: any = ((expirationTime - currentTime) / 1000).toFixed(0);

                const cooldown = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`⏰ Please wait ${timeLeft} second${timeLeft === 1 ? "" : "s"} before running that command again!`)

                command.deferReply ? await interaction.editReply({ embeds: [cooldown] }) : await interaction.reply({ embeds: [cooldown], ephemeral: true });
                return;
            }
        }

        timeStamps.set(interaction.user.id, currentTime);

        setTimeout(() => {
            timeStamps.delete(interaction.user.id);
        }, cooldownAmount)

        try {
            await command.execute(interaction, client, Discord);
        } catch(err) {
            client.logError(err);

            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.cross} There was an error while executing that command!`)

            command.deferReply ? await interaction.editReply({ embeds: [error] }) : await interaction.reply({ embeds: [error], ephemeral: true });
        }
    } catch(err) {
        client.logError(err);
    }
}
