import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, Snowflake } from "discord.js";

import Guild from "../../models/Guild";
import Message from "../../models/Message";
import User from "../../models/User";

const command: Command = {
    name: "stats",
    description: "[DEVELOPER ONLY] Get some statistics about Global Chat.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 300,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: true,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            // Get % of guilds registered
            const guilds = await Guild.find({ channel: { $ne: null } });

            // Get % of users who have a role out of client.users.cache.size
            const users = await User.find();
            const usersWithRoles = [];

            for(const user of users) {
                if(user.dev || user.mod || user.donator || user.verified) usersWithRoles.push(user._id);
            }

            // Get percentage
            const guildPercentage = Math.round((guilds.length / client.guilds.cache.size) * 100);
            const userPercentage = Math.round((usersWithRoles.length / client.users.cache.size) * 100);

            // Get the average amount of messages sent per user
            const messages = await Message.find();
            const averageMessages = Math.round(messages.length / users.length);

            // Get percentage of users that have sent a message
            const usersWithMessages: Snowflake[] = [];

            for(const message of messages) {
                if(!usersWithMessages.includes(message.user)) usersWithMessages.push(message.user);
            }

            const userMessagePercentage = Math.round((usersWithMessages.length / client.users.cache.size) * 100);

            const stats = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Global Chat Statistics")
                .addFields (
                    { name: "Guilds Registered (%)", value: `${guildPercentage}%`, inline: true },
                    { name: "Users with roles (%)", value: `${userPercentage}%`, inline: true },
                    { name: "Average message count per user", value: `${averageMessages}`, inline: true },
                    { name: "Users which have sent messages (%)", value: `${userMessagePercentage}%`, inline: true }
                )

            await interaction.editReply({ embeds: [stats] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
