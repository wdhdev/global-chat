import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { createInfractionLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import Infraction from "../../models/Infraction";

const command: Command = {
    name: "delwarn",
    description: "[MODERATOR ONLY] Delete a user's warn.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's warn to remove.",
            required: true
        },

        {
            type: 3,
            name: "warn",
            description: "The warning ID.",
            min_length: 8,
            max_length: 8,
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
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: typeof import("discord.js")) {
        try {
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const user = interaction.options.getUser("user");
            const warn = interaction.options.get("warn").value;
            
            if(!await Infraction.find({ _id: user.id, "warnings.id": warn })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That warning does not exist!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            let data = await Infraction.findOne({ _id: user.id });

            data.warnings = data.warnings.filter(warning => warning.id !== warn);
            await data.save();

            await createInfractionLog(user.id, warn, "warnDelete", interaction.user.id);

            const deleted = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} The warning \`${warn}\` has been removed from ${user}.`)

            await interaction.editReply({ embeds: [deleted] });

            const warnLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("Deleted Warning")
                .addFields (
                    { name: "⚠️ Warning", value: `\`${warn}\`` },
                    { name: "👤 User", value: `${user}` }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [warnLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
