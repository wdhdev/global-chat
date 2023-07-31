import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";
import User from "../../models/User";

import { emojis as emoji } from "../../config";
import { Types } from "mongoose";


const command: Command = {
    name: "addnick",
    description: "[MODERATOR ONLY] Add a nickname to a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user to add the nick to.",
            required: true
        },

        {
            type: 3,
            name: "nick",
            description: "The nickname to add.",
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
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const users = interaction.options.getUser("user");
            const nick = interaction.options.get("nick").value;

            await User.findOneAndUpdate({ _id: users }, { nick: nick });

            const nickadded = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle(`${emoji.checkmark} Nickname added`)
                .setDescription(`**User:** ${users}\n**Nickname:** ${nick}`)
                .setTimestamp();

            
            await interaction.editReply({ embeds: [nickadded] });

            
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
