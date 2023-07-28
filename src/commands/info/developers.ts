import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

import User from "../../models/User";

const command: Command = {
    name: "developers",
    description: "Get a list of all the developers.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
    allowWhileBanned: false,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const data = await User.find({ dev: true });

            const users = [];

            for(const user of data) {
                users.push(user._id);
            }

            if(!users.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There are no developers!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const developers = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("💻 Developers")
                .setDescription(`<@${users.join(">, <@")}>`)

            await interaction.editReply({ embeds: [developers] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
