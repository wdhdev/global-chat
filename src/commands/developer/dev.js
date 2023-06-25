const emoji = require("../../config.json").emojis;
const fetch = require("node-fetch");

const devSchema = require("../../models/devSchema");

module.exports = {
	name: "dev",
	description: "Developer Commands",
    options: [
        {
            type: 1,
            name: "errors",
            description: "Get all unresolved errors on Sentry.",
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
                const path = require("path");

                const image = path.resolve("./src/assets/sentry-glyph-light-400x352.png");

                const result = await fetch(`https://sentry.io/api/0/projects/${process.env.sentry_org}/${process.env.sentry_project}/issues/`, {
                    headers: {
                        Authorization: `Bearer ${process.env.sentry_bearer}`
                    }
                }).then(res => res.json())

                if(!result.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There are no unresolved issues on Sentry!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const issues = [];

                for(const issue of result) {
                    issues.push(`- [${issue.title}](${issue.permalink})`);
                }

                const data = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setThumbnail("attachment://sentry-glyph-light-400x352.png")
                    .setTitle("Unresolved Issues")
                    .setDescription(issues.join("\n"))

                const action = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Success)
                            .setCustomId("resolve-all-errors")
                            .setLabel("Resolve All")
                    )

                await interaction.editReply({ embeds: [data], components: [action], files: [image] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}