import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import { Octokit } from "@octokit/core";

import GitHubUser from "../../models/GitHubUser";
import User from "../../models/User";

const command: Command = {
    name: "delete-my-data",
    description: "Delete all data associated with your account.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 120,
    enabled: true,
    allowWhileBanned: true,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const userData = await User.findOne({ _id: interaction.user.id });
            const githubData = await GitHubUser.findOne({ _id: interaction.user.id });

            if(!userData && !githubData) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There is no data associated with your account!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const embed = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setTitle("Delete My Data")
                .setDescription("Are you sure you want to delete all data associated with your account?\n**This cannot be undone.**")
                .addFields (
                    { name: "✅ Will be deleted", value: "🎭 Roles\n🔗 Linked Accounts", inline: true },
                    { name: "❌ Won't be deleted", value: "📜 Audit Logs\n📝 Infractions\n💬 Messages\n⛔ Blocked Messages", inline: true }
                )
                .setFooter({ text: "This prompt will expire in 30 seconds." })

            const actions: any = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setCustomId(`delete-${interaction.id}`)
                        .setLabel("Confirm"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setCustomId(`cancel-${interaction.id}`)
                        .setLabel("Cancel")
                )

            await interaction.editReply({ embeds: [embed], components: [actions] });
            const collector = interaction.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 30000 });

            collector.on("collect", async c => {
                if(c.user.id !== interaction.user.id) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} This button is not for you!`)

                    c.reply({ embeds: [error], ephemeral: true });
                    return;
                }

                if(c.customId === `delete-${interaction.id}`) {
                    collector.stop();

                    if(githubData) {
                        try {
                            const octokit = new Octokit({ auth: githubData.token });

                            await octokit.request("DELETE /applications/{client_id}/grant", {
                                client_id: process.env.github_client_id,
                                access_token: githubData.token
                            })
                        } catch {}

                        await githubData.deleteOne();
                    }

                    await userData.deleteOne();

                    const deleted = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} All of your data has been deleted!`)

                    await interaction.editReply({ embeds: [deleted], components: [] });
                    return;
                }

                if(c.customId === `cancel-${interaction.id}`) {
                    collector.stop();

                    const cancelled = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Operation cancelled.`)

                    await interaction.editReply({ embeds: [cancelled], components: [] });
                    return;
                }
            })

            collector.on("end", async collected => {
                let validInteractions = [];

                collected.forEach(c => {
                    if(c.user.id === interaction.user.id) validInteractions.push(c);
                })

                if(validInteractions.length == 0) {
                    const cancelled = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Operation cancelled.`)

                    await interaction.editReply({ embeds: [cancelled], components: [] });
                }
            })
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
