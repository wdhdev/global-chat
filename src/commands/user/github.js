const { Octokit } = require("@octokit/core");

const emoji = require("../../config").emojis;

const AuthToken = require("../../models/AuthToken");
const GitHubUser = require("../../models/GitHubUser");

module.exports = {
    name: "github",
    description: "Manage your GitHub account linked to Global Chat.",
    options: [
        {
            type: 1,
            name: "account",
            description: "Get information about your linked GitHub account.",
            options: []
        },

        {
            type: 1,
            name: "link",
            description: "Link your GitHub account to Global Chat.",
            options: []
        },

        {
            type: 1,
            name: "unlink",
            description: "Unlink your GitHub account from Global Chat.",
            options: []
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
    async execute(interaction, client, Discord) {
        try {
            if(interaction.options.getSubcommand() === "account") {
                let data = await GitHubUser.findOne({ _id: interaction.user.id });

                if(!data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You have not linked your GitHub account! Use \`/github link\` to login`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

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

                const account = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.github)
                    .setThumbnail(data.avatar_url)
                    .setTitle("Your GitHub Account")
                    .addFields (
                        { name: "Username", value: data.username },
                        { name: "Email", value: userEmail },
                        { name: "Linked", value: `<t:${data.linked.toString().slice(0, -3)}> (<t:${data.linked.toString().slice(0, -3)}:R>)` }
                    )

                const actions = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Danger)
                            .setCustomId("github-unlink")
                            .setLabel("Logout")
                    )

                await interaction.editReply({ embeds: [account], components: [actions] });
                return;
            }

            if(interaction.options.getSubcommand() === "link") {
                const data = await GitHubUser.findOne({ _id: interaction.user.id });

                if(data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You have already linked your GitHub account! Use \`/github unlink\` to logout.`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const token = require("crypto").randomUUID();

                new AuthToken({
                    _id: token,
                    user: interaction.user.id,
                    service: "github"
                }).save()

                const button = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Link)
                            .setEmoji(emoji.github)
                            .setLabel("Sign in with GitHub")
                            .setURL(`https://gc-auth.wdh.gg/github?user=${interaction.user.id}&token=${token}`)
                    )

                await interaction.editReply({ components: [button] });
                return;
            }

            if(interaction.options.getSubcommand() === "unlink") {
                const data = await GitHubUser.findOne({ _id: interaction.user.id });

                if(!data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You have not linked your GitHub account! Use \`/github link\` to login.`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                try {
                    const octokit = new Octokit({ auth: data.token });

                    await octokit.request('DELETE /applications/{client_id}/grant', {
                        client_id: process.env.github_client_id,
                        access_token: data.token
                    })
                } catch {}

                await data.delete();

                const unlinked = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.github)
                    .setDescription(`${emoji.tick} Your GitHub account has been unlinked.`)

                await interaction.editReply({ embeds: [unlinked] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
