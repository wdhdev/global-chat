import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction } from "discord.js";

import Button from "../../classes/Button";

import { emojis as emoji } from "../../config";
import getRoles from "../roles/get";

export = async (client: ExtendedClient, Discord: any, interaction: ButtonInteraction) => {
    try {
        const button: Button = client.buttons.get(interaction.customId);

        if(button) {
            const requiredRoles: Array<string> = button.requiredRoles.get();
            const userRoles: any = await getRoles(interaction.user.id, client);

            if(requiredRoles.length) {
                const hasRoles = [];

                for(const role of requiredRoles) {
                    if(userRoles[role]) hasRoles.push(role);
                }

                if(requiredRoles.length !== hasRoles.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You do not have permission to run this button!`)

                    await interaction.reply({ embeds: [error], ephemeral: true });
                    return;
                }
            }

            try {
                await button.execute(interaction, client, Discord);
            } catch(err) {
                client.logError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There was an error while executing that button!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
            }

            return;
        }

        for(const btn of client.buttons) {
            if(interaction.customId.startsWith(btn[0]) && btn[1].startsWith) {
                const requiredRoles: Array<string> = btn[1].requiredRoles.get();
                const userRoles: any = await getRoles(interaction.user.id, client);

                if(requiredRoles.length) {
                    const hasRoles = [];

                    for(const role of requiredRoles) {
                        if(userRoles[role]) hasRoles.push(role);
                    }

                    if(requiredRoles.length !== hasRoles.length) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.cross} You do not have permission to run this button!`)

                        await interaction.reply({ embeds: [error], ephemeral: true });
                        return;
                    }
                }

                try {
                    await btn[1].execute(interaction, client, Discord);
                } catch(err) {
                    client.logError(err);

                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There was an error while executing that button!`)

                    await interaction.reply({ embeds: [error], ephemeral: true });
                }

                break;
            }
        }
    } catch(err) {
        client.logError(err);
    }
}
