import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, TextChannel } from "discord.js";

import deleteWebhooks from "../../scripts/delete-webhooks";
import { emojis as emoji } from "../../config";

const command: Command = {
    name: "delete-webhooks",
    description: "[DEVELOPER ONLY] Delete all Global Chat webhooks.",
    options: [],
    default_member_permissions: null,
    botPermissions: ["ManageWebhooks"],
    requiredRoles: ["dev"],
    cooldown: 300,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const renewing = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.ping} Deleting webhooks...`)

            const i = await interaction.editReply({ embeds: [renewing] });

            const output = await deleteWebhooks(client);

            if(!output.length) {
                const noRenewals = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} No webhooks were found!`)

                await i.edit({ embeds: [noRenewals] });
                return;
            }

            const buffer = Buffer.from(output.join("\n"), "utf-8");
            const file = new Discord.AttachmentBuilder(buffer, { name: "result.txt" });

            const channel = client.channels.cache.get(client.config_channels.logs) as TextChannel;

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("Webhook Deletion")
                .setTimestamp()

            channel.send({ embeds: [log], files: [file] });

            const renewed = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} All webhooks have been deleted!`)

            await i.edit({ embeds: [renewed], files: [file] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
