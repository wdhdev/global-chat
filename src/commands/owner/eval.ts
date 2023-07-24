import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

const command: Command = {
    name: "eval",
    description: "[OWNER ONLY] Evaluate code on the bot.",
    options: [
        {
            type: 3,
            name: "code",
            description: "The code you want to evaluate.",
            max_length: 1000,
            required: true
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
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const input: any = interaction.options.get("code").value;

            try {
                const output = new String(await eval(`(async () => {${input}})()`));

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "Input", value: `\`\`\`${input}\`\`\`` },
                        { name: "Output", value: `\`\`\`${output}\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result] });
            } catch(err) {
                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .addFields (
                        { name: "Input", value: `\`\`\`${input}\`\`\`` },
                        { name: "Output", value: `\`\`\`${err.message}\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result] });
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
