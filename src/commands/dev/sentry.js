const emoji = require("../../config.json").emojis;
const fetch = require("node-fetch");

const devSchema = require("../../models/devSchema");

module.exports = {
	name: "sentry",
	description: "Manage Sentry",
    options: [
        {
            type: 1,
            name: "errors",
            description: "[DEVELOPER ONLY] Get all unresolved errors on Sentry.",
            options: []
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });

            if(!dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(interaction.options.getSubcommand() === "errors") {
                const result = await fetch(`https://sentry.io/api/0/projects/${process.env.sentry_org}/${process.env.sentry_project}/issues/`, {
                    headers: {
                        Authorization: `Bearer ${process.env.sentry_bearer}`
                    }
                }).then(res => res.json())

                if(!result.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There are no unresolved issues!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const issues = [];

                for(const issue of result) {
                    issues.push(`- [${issue.title}](${issue.permalink})`);
                }

                const data = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Unresolved Issues")
                    .setDescription(issues.join("\n"))

                const action = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Success)
                            .setCustomId("resolve-all-errors")
                            .setLabel("Resolve All")
                    )

                await interaction.editReply({ embeds: [data], components: [action] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}