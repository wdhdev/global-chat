import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import deleteWebhook from "../../functions/webhooks/delete";

const command: Command = {
    name: "delete-webhook",
    description: "[DEVELOPER ONLY] Delete a webhook.",
    options: [
        {
            type: 3,
            name: "webhook",
            description: "The URL of the webhook.",
            min_length: 121,
            max_length: 121,
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const webhook: any = interaction.options.get("webhook").value;

            const data = await deleteWebhook(webhook);

            if(data.status === 204) {
                const deleted = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.cross} The webhook has been deleted!`)

                await interaction.editReply({ embeds: [deleted] });
                return;
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That webhook does not exist!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
