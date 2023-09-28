import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../config";
import { getLogs } from "../../classes/Log";

const command: Command = {
    name: "my-logs",
    description: "Get all of your logs.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 20,
    enabled: true,
    allowWhileBanned: true,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: typeof import("discord.js")) {
        try {
            const logs = await getLogs(interaction.user.id, -1, true);

            if(!logs.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You do not have any logs!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const auditLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Audit Log")
                .setDescription(cap(logs.join("\n"), 2000))

            await interaction.editReply({ embeds: [auditLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
