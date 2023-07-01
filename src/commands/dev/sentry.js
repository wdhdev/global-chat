const emoji = require("../../config.json").emojis;
const fetch = require("node-fetch");

const devSchema = require("../../models/devSchema");
const sentrySchema = require("../../models/sentrySchema");

module.exports = {
	name: "sentry",
	description: "Manage Sentry",
    options: [
        {
            type: 1,
            name: "deregister",
            description: "[DEVELOPER ONLY] Deregister a Sentry capture URL.",
            options: [
                {
                    type: 3,
                    name: "token",
                    description: "The Sentry capture token.",
                    min_length: 36,
                    max_length: 36,
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "errors",
            description: "[DEVELOPER ONLY] Get all unresolved errors on Sentry.",
            options: []
        },

        {
            type: 1,
            name: "register",
            description: "[DEVELOPER ONLY] Register a Sentry capture URL.",
            options: [
                {
                    type: 7,
                    name: "channel",
                    description: "The channel where new issues should be sent.",
                    channel_types: [0],
                    required: true
                }
            ]
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

            if(interaction.options.getSubcommand() === "deregister") {
                const token = interaction.options.getString("token");

                if(!await sentrySchema.exists({ _id: token })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} That capture URL does not exist!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                await sentrySchema.findOneAndDelete({ _id: token });

                const deleted = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} That capture URL has been deleted!`)

                await interaction.editReply({ embeds: [deleted] });
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

                await interaction.editReply({ embeds: [data] });
                return;
            }

            if(interaction.options.getSubcommand() === "register") {
                const channel = interaction.options.getChannel("channel");

                const id = require("crypto").randomUUID();

                new sentrySchema({
                    _id: id,
                    channel: channel.id,
                    registered: Date.now(),
                    user: interaction.user.id
                }).save()

                const registered = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} A new capture URL has been registered!`)

                const actions = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId(`sentry-capture-${id}`)
                            .setEmoji("ℹ️")
                            .setLabel("Capture Details")
                    )

                await interaction.editReply({ embeds: [registered], components: [actions] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}