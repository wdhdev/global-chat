import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";
import killswitch from "../../models/killswitch";

import { announce } from "../../util/send";
import { emojis as emoji } from "../../config";

const command: Command = {
    name: "announce",
    description: "[STAFF ONLY] Emergency killswitch.",
    options: [],
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
            const killData = await killswitch.findOne({ killswitch: true });
            if (killData) {
                await killswitch.findOneAndUpdate({ killswitch: false });
                const text = `${emoji.tick} The killswitch has been deactivated.`
                await announce(text, interaction, client, Discord);
                return;
            } else {
                (await killswitch.create({ killswitch: true })).save();
                const text = `${emoji.tick} The killswitch has been activated.`
                await announce(text, interaction, client, Discord);
                return;
            }
            
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;