import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import getDomain from "../../functions/getDomain";

import WhitelistedDomain from "../../models/WhitelistedDomain";

const command: Command = {
    name: "unwhitelist-domain",
    description: "[DEVELOPER ONLY] Remove a domain from the whitelist.",
    options: [
        {
            type: 3,
            name: "domain",
            description: "The domain to remove from the whitelist.",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles(["dev"]),
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const domain = getDomain(interaction.options.get("domain").value);

            const data = await WhitelistedDomain.findOne({ _id: domain });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} \`${domain}\` is not whitelisted!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            await data.delete();

            const unwhitelisted = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} \`${domain}\` has been removed from the whitelist!`)

            await interaction.editReply({ embeds: [unwhitelisted] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
