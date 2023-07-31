import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../config";
import { getInfractions } from "../../classes/Infraction";

const command: Command = {
    name: "infractions",
    description: "[MODERATOR ONLY] Get all of a user's infractions.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's infractions to get.",
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
    ephemeral: false,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            const user = interaction.options.getUser("user");

            const infractions = await getInfractions(user.id, -1, false);

            if(!infractions.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} does not have any infractions!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const infractionLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` })
                .setTitle("Infractions")
                .setDescription(cap(infractions.join("\n"), 2000))

            await interaction.editReply({ embeds: [infractionLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
