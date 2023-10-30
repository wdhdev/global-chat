import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, TextChannel, GuildChannel, MessageActionRow, MessageButton } from "discord.js";

import { emojis as emoji } from "../../config";
import renewWebhooks from "../../scripts/renew-webhooks";

const command: Command = {
    name: "list-channels",
    description: "[DEVELOPER ONLY] List all channels in every guild as a file.",
    options: [],
    default_member_permissions: null,
    botPermissions: ["ManageWebhooks"],
    requiredRoles: ["dev"],
    cooldown: 300,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false, // Set this to false to make it work outside of guilds
    deferReply: true,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const allChannels = [];

            // Iterate through the guilds the bot is a member of
            client.guilds.cache.forEach((guild) => {
                const guildChannels = guild.channels.cache.filter((channel) => channel instanceof GuildChannel);
                allChannels.push(...guildChannels.map((channel) => `${channel.name} (ID: ${channel.id}) in ${guild.name}`));
            });

            // Create a text file with the list of channels
            const channelListText = `List of channels in every guild:\n${allChannels.join("\n")}`;

            // Send the file as a message with a button to download
            const fileBuffer = Buffer.from(channelListText, "utf-8");
            const file = new Discord.MessageAttachment(fileBuffer, "channel-list.txt");

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("download")
                        .setLabel("Download List")
                        .setStyle("PRIMARY")
                );

            await interaction.editReply({ files: [file], components: [row] });

        } catch (err) {
            client.logCommandError(err, interaction, Discord);
        }
    },
};

export = command;
