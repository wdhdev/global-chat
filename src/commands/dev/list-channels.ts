import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, TextChannel, GuildChannel } from "discord.js";
import fs from "fs";

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
            fs.writeFileSync("channel-list.txt", channelListText);

            // Send the file as an attachment
            const file = new Discord.AttachmentBuilder("channel-list.txt");

            // Send the file as a reply
            await interaction.editReply({ files: [file] });
        } catch (err) {
            client.logCommandError(err, interaction, Discord);
        }
    },
};

export = command;
