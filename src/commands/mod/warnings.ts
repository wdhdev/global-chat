import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../config";
import { getWarnings } from "../../classes/Warning";

const command: Command = {
    name: "warnings",
    description: "[MODERATOR ONLY] Get a user's warnings.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's warnings to get.",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            const user = interaction.options.getUser("user");

            const warnings = await getWarnings(user.id);

            if(!warnings.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} does not have any warnings!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const warns = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` })
                .setTitle("Warnings")
                .setDescription(cap(warnings.join("\n"), 2000))

            await interaction.editReply({ embeds: [warns] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
