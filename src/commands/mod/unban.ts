import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { createInfractionLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import BannedUser from "../../models/BannedUser";

const command: Command = {
    name: "unban",
    description: "[MODERATOR ONLY] Unban a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user you want to unban.",
            required: true
        },

        {
            type: 3,
            name: "reason",
            description: "Why you want to unban the user.",
            max_length: 250,
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
            const reason = interaction.options.get("reason").value;

            const data = await BannedUser.findOne({ _id: user.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} is not banned!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            await data.delete();

            await createInfractionLog(user.id, null, "unban", interaction.user.id);

            const userDM = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.green)
                .setTitle("🙌 Unban")
                .setDescription(`${emoji.tick} You have been unbanned from Global Chat.`)
                .addFields (
                    { name: "❓ Reason", value: reason }
                )
                .setTimestamp()

            let sentDM = false;

            try {
                await user.send({ embeds: [userDM] });

                sentDM = true;
            } catch {}

            const unbanned = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user} has been unbanned.`)

            await interaction.editReply({ embeds: [unbanned] });

            const banLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("User Unbanned")
                .addFields (
                    { name: "👤 User", value: `${user}` },
                    { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                    { name: "❓ Reason", value: reason }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [banLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
