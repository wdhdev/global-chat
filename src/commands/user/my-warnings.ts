import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../config";
import { getWarnings } from "../../classes/Warning";

const command: Command = {
    name: "my-warnings",
    description: "Get all of your warnings.",
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
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            const warnings = await getWarnings(interaction.user.id);

            if(!warnings.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You do not have any warnings!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const warningsLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Warnings")
                .setDescription(cap(warnings.join("\n"), 2000))

            await interaction.editReply({ embeds: [warningsLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
