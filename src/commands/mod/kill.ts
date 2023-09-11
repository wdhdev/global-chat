import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";
import killswitch from "../../models/killswitch";
import { announce } from "../../util/send";


import { emojis as emoji } from "../../config";

const command: Command = {
    name: "kill",
    description: "Killswitch.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 10,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false,
    deferReply: false,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const killData = await killswitch.findOne({ killswitch: true });
            if (killData) {
                await killswitch.findOneAndUpdate({ killswitch: false });
                const text = `${emoji.tick} The killswitch has been deactivated.`
                await announce(text, interaction, client, Discord);
                const killswitchMessage = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "KillSwitch", value: 'Deactivated', inline: true }
                    )
                await interaction.reply({ embeds: [killswitchMessage] });
                return;
            } else {
                (await killswitch.create({ killswitch: true })).save();
                const text = `${emoji.tick} The killswitch has been activated.`
                await announce(text, interaction, client, Discord);
                const killswitchMessage = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "KillSwitch", value: 'Activated', inline: true }
                    )
                await interaction.reply({ embeds: [killswitchMessage] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
