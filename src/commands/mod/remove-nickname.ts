import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { createLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import User from "../../models/User";

const command: Command = {
    name: "remove-nickname",
    description: "[MODERATOR ONLY] Remove a user's nickname.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's nickname to remove.",
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
    async execute(interaction: CommandInteraction, client: ExtendedClient & any, Discord: any) {
        try {
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const user = interaction.options.getUser("user");

            const userData = await User.findOne({ _id: user.id });

            if(!userData?.nickname) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} does not have a nickname!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            await User.findOneAndUpdate({ _id: user.id }, { nickname: null, imageURL: null });

            const removed = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user}'s nickname has been removed.`)

            await interaction.editReply({ embeds: [removed] });

            await createLog(user.id, null, "nicknameRemove", null, null, interaction.user.id);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("👤 Nickname Changed")
                .addFields (
                    { name: "Old Nickname", value: `\`${userData.nickname}\``, inline: true },
                    { name: "New Nickname", value: `*None*`, inline: true },
                    { name: "User", value: `${user}` }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [log] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
