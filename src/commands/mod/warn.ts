import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { cannotWarnBots, cannotWarnUser, cannotWarnYourself } from "../../util/embeds";
import { emojis as emoji } from "../../config";
import warn from "../../functions/warn";

import User from "../../models/User";

const command: Command = {
    name: "warn",
    description: "[MODERATOR ONLY] Warn a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user you want to warn.",
            required: true
        },

        {
            type: 3,
            name: "reason",
            description: "Why you want to warn the user.",
            max_length: 100,
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

            const user = interaction.options.getUser("user");
            const reason = interaction.options.get("reason").value;

            if(user.id === interaction.user.id) return await interaction.editReply({ embeds: [cannotWarnYourself] });

            if(user.bot) return await interaction.editReply({ embeds: [cannotWarnBots] });

            if(await User.exists({ _id: user.id, immune: true })) return await interaction.editReply({ embeds: [cannotWarnUser] });

            const id = await warn(user.id, reason, interaction.user.id);

            const warning = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setTitle("⚠️ Warning")
                .addFields (
                    { name: "❓ Reason", value: reason }
                )
                .setTimestamp()

            let sentDM = false;

            try {
                await user.send({ embeds: [warning] });
                sentDM = true;
            } catch {}

            const warned = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user} has been warned.`)

            await interaction.editReply({ embeds: [warned] });

            const warnLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("User Warned")
                .addFields (
                    { name: "📄 ID", value: `\`${id}\`` },
                    { name: "👤 User", value: `${user}` },
                    { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                    { name: "❓ Reason", value: reason }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [warnLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
