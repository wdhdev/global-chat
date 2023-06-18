const emoji = require("../config.json").emojis;
const fetch = require("node-fetch");

const devSchema = require("../models/devSchema");

module.exports = {
	name: "dev",
	description: "Developer Commands",
    options: [
        {
            type: 1,
            name: "errors",
            description: "Get all unresolved errors on Sentry.",
            options: []
        },

        {
            type: 1,
            name: "reload",
            description: "Reload a command.",
            options: [
                {
                    type: 3,
                    name: "command",
                    description: "The command to reload.",
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

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            if(interaction.options.getSubcommand() === "errors") {
                const result = await fetch(`https://sentry.io/api/0/projects/${process.env.sentry_org}/${process.env.sentry_project}/issues/`, {
                    headers: {
                        Authorization: `Bearer ${process.env.sentry_bearer}`
                    }
                }).then(res => res.json())

                if(!result.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There are no errors!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const issues = [];

                for(const issue of result) {
                    issues.push(`- [${issue.title}](${issue.permalink})`);
                }

                const data = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Issues")
                    .setDescription(issues.join("\n"))

                await interaction.editReply({ embeds: [data] });
                return;
            }

            if(interaction.options.getSubcommand() === "reload") {
                const cmd = interaction.options.getString("command").toLowerCase();
                const command = client.commands.get(cmd);

                if(!command) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} No command exists with that name!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                delete require.cache[require.resolve(`./${command.name}.js`)];
                client.commands.delete(command.name);

                const newCommand = require(`./${command.name}.js`);

                client.commands.set(newCommand.name, newCommand);

                const reloaded = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} \`/${cmd}\` was reloaded!`)

                await interaction.editReply({ embeds: [reloaded] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Command Reloaded")
                    .addFields (
                        { name: "📄 Command", value: `\`/${cmd}\`` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}