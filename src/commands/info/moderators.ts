import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

import User from "../../models/User";

const command: Command = {
    name: "moderators",
    description: "Get a list of all the moderators.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles([]),
    cooldown: 5,
    enabled: true,
    allowWhileBanned: false,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const data = await User.find({ mod: true });

            const users = [];

            for(const user of data) {
                users.push(user._id);
            }

            if(!users.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There are no moderators!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const moderators = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🔨 Moderators")
                .setDescription(`<@${users.join(">, <@")}>`)

            await interaction.editReply({ embeds: [moderators] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
