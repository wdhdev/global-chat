import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { Octokit } from "@octokit/core";
import { emojis as emoji } from "../../config";

import GitHubUser from "../../models/GitHubUser";

export = {
    name: "suggest",
    description: "Suggest something.",
    options: [
        {
            type: 1,
            name: "easter-egg",
            description: "Suggest an easter egg for the bot.",
            options: [
                {
                    type: 3,
                    name: "prompt",
                    description: "What will trigger the easter egg.",
                    min_length: 4,
                    max_length: 30,
                    required: true
                },

                {
                    type: 3,
                    name: "output",
                    description: "What will the easter egg output.",
                    min_length: 10,
                    max_length: 1000,
                    required: true
                },

                {
                    type: 3,
                    name: "casing",
                    description: "Whether the prompt is case-sensitive or not.",
                    choices: [
                        {
                            name: "insensitive",
                            value: "case-insensitive"
                        },

                        {
                            name: "sensitive",
                            value: "case-sensitive"
                        }
                    ],
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient, Discord: any) {
        try {
            let data = await GitHubUser.findOne({ _id: interaction.user.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You have not linked your GitHub account! Use \`/github link\` to login.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const prompt = interaction.options.getString("prompt");
            const output = interaction.options.getString("output");
            const casing = interaction.options.getString("casing");

            const octokit = new Octokit({ auth: data.token });

            const user = (await octokit.request("GET /user", {})).data;
            const emails = (await octokit.request("GET /user/emails", {})).data;

            let userEmail = "";

            emails.forEach(e => {
                if(e.primary) userEmail = e.email;
            })

            const oldData = {
                id: data.id,
                avatar_url: data.avatar_url,
                username: data.username,
                email: data.email
            }

            const newData = {
                id: user.id,
                avatar_url: user.avatar_url,
                username: user.login,
                email: userEmail
            }

            if(oldData.id !== newData.id || oldData.avatar_url !== newData.avatar_url || oldData.username !== newData.username || oldData.email !== newData.email) {
                data = await GitHubUser.findOneAndUpdate({ _id: interaction.user.id }, {
                    id: user.id,
                    avatar_url: user.avatar_url,
                    username: user.login,
                    email: userEmail,
                    lastUpdated: Date.now()
                }, { returnOriginal: false })
            }

            const issue = await octokit.request("POST /repos/{owner}/{repo}/issues", {
                owner: "Global-Chat-Bot",
                repo: "easter-eggs",
                title: `[${casing}] ${casing === "case-sensitive" ? prompt : prompt.toLowerCase()}`,
                body: `## Request Information\n**User**: ${interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag} (${interaction.user.id})\n**Guild**: ${interaction.guild.name} (${interaction.guild.id})\n\n## Prompt\n\`\`\`\n${casing === "sensitive" ? prompt : prompt.toLowerCase()}\n\`\`\`\n\n## Output\n\`\`\`\n${output}\n\`\`\``
            })

            const result = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} An issue with your suggestion has been created.`)

            const button = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji(emoji.github)
                        .setLabel(`Issue #${issue.data.number}`)
                        .setURL(issue.data.html_url)
                )

            await interaction.editReply({ embeds: [result], components: [button] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
