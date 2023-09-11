import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";
import killswitch from "../../models/killswitch";

import { announce } from "../../util/send";
import { emojis as emoji } from "../../config";

const command: Command = {
    name: "announce",
    description: "[STAFF ONLY] Emergency killswitch.",
    options: [
        {
            type: 3,
            name: "message",
            description: "Killswitch message.",
            min_length: 3,
            max_length: 64,
            required: true
        },

        {
            type: 3,
            name: "enable",
            description: "Do you want to enable or disable the killswitch?",
            choices: [
                {
                    name: "enable",
                    value: "enable"
                },

                {
                    name: "disable",
                    value: "disable"
                }
            ],
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 60,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: false,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const message = interaction.options.get("message").value;
            const enable = interaction.options.get("enable").value;
            if (enable === "enable") {
                await interaction.reply({ content: `${emoji.tick} Killswitch enabled.` });
            }
            const killData = await killswitch.findOne({ killswitch: enable});
            if (killData) {
                await killswitch.findOneAndUpdate({ killswitch: enable }, { message: message });
            } else {
                (await killswitch.create({ killswitch: enable, message: message })).save();
            }
            
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;