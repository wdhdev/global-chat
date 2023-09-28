import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { announce } from "../../util/send";
import { emojis as emoji } from "../../config";

const command: Command = {
    name: "kill-switch",
    description: "[STAFF ONLY] Kill the bot in the event of an emergency.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["staff"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            if(client.killSwitch) {
                client.killSwitch = false;

                await announce("The kill switch has been deactivated.\nThe bot will now respond to all commands and continue to process messages.", interaction, client, Discord);

                const status = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "Kill Switch", value: `${emoji.cross} Deactivated` }
                    )

                await interaction.editReply({ embeds: [status] });
                return;
            } else {
                client.killSwitch = true;

                await announce("The kill switch has been activated.\n\nThe bot will no longer process any events until the kill switch is disabled.", interaction, client, Discord);

                const status = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "Kill Switch", value: `${emoji.tick} Activated` }
                    )

                await interaction.editReply({ embeds: [status] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
