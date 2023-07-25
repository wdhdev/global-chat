import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../config";
import { getLogs } from "../../classes/Log";

const command: Command = {
    name: "logs",
    description: "[MODERATOR ONLY] Get all of a user's logs.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's logs to get.",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles(["mod"]),
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            const user = interaction.options.getUser("user");

            const logs = await getLogs(user.id, -1, false);

            if(!logs.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} does not have any logs!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const auditLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` })
                .setTitle("Audit Log")
                .setDescription(cap(logs.join("\n"), 2000))

            await interaction.editReply({ embeds: [auditLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
