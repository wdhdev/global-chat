import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../config";
import { getInfractions } from "../../classes/Infraction";

const command: Command = {
    name: "my-infractions",
    description: "Get all of your infractions.",
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
            const infractions = await getInfractions(interaction.user.id, -1, true);

            if(!infractions.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You do not have any infractions!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const infractionLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Infractions")
                .setDescription(cap(infractions.join("\n"), 2000))

            await interaction.editReply({ embeds: [infractionLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
