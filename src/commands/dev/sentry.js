const emoji = require("../../config.json").emojis;
const fetch = require("node-fetch");

const sentrySchema = require("../../models/sentrySchema");

module.exports = {
	name: "sentry",
	description: "Manage Sentry",
    options: [
        {
            type: 1,
            name: "capture-info",
            description: "[DEVELOPER ONLY] Get information about a capture token.",
            options: []
        },

        {
            type: 1,
            name: "capture-tokens",
            description: "[DEVELOPER ONLY] Get a list of all the active capture tokens.",
            options: []
        },

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
    requiredRoles: ["dev"],
    cooldown: 0,
    enabled: true,
    hidden: true,
    deferReply: true,
    ephemeral: true,
	async execute(interaction, client, Discord) {
        try {
            if(interaction.options.getSubcommand() === "capture-info") {
                const actions = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setCustomId("sentry-capture-info")
                            .setEmoji("📝")
                            .setLabel("Get Token")
                    )

                await interaction.editReply({ components: [actions] });
                return;
            }

            if(interaction.options.getSubcommand() === "capture-tokens") {
                const data = await sentrySchema.find();

                const tokens = [];

                for(const token of data) {
                    tokens.push(`\`${token._id}\``);
                }

                if(!tokens.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There are no tokens!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const tokenInfo = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("🔑 Tokens")
                    .setDescription(tokens.join("\n"))
    
                await interaction.editReply({ embeds: [tokenInfo] });
                return;
            }

            if(interaction.options.getSubcommand() === "deregister") {
                const token = interaction.options.getString("token");

                if(!await sentrySchema.exists({ _id: token })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} That capture token does not exist!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await sentrySchema.findOneAndDelete({ _id: token });

                const deleted = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} That capture token has been deleted!`)

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
                        .setDescription(`${emoji.cross} There are no unresolved issues!`)

                    await interaction.editReply({ embeds: [error] });
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
                    .setTitle("New Capture Token")
                    .addFields (
                        { name: "🔑 Token", value: id },
                        { name: "🔗 URL", value: `https://gc-sentry-api.wdh.gg/${id}` }
                    )

                await interaction.editReply({ embeds: [registered] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}