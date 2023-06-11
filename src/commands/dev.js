const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");

module.exports = {
	name: "dev",
	description: "Manage the developer role.",
    options: [
        {
            type: 1,
            name: "add",
            description: "Promote a user to a developer.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to promote.",
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "remove",
            description: "Demote a user from a developer.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to demote.",
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
            if(interaction.user.id !== client.config_default.owner) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const user = interaction.options.getUser("user");

            if(interaction.options.getSubcommand() === "add") {
                if(user.bot) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} You cannot add a bot to the developer role!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                if(await devSchema.exists({ _id: user.id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} ${user} is already a developer!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                data = new devSchema({ _id: user.id });

                await data.save();

                const added = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} ${user} has been added to the developer role.`)

                await interaction.editReply({ embeds: [added] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("➕ Role Added")
                    .addFields (
                        { name: "🎭 Role", value: "💻 Developer" },
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }

            if(interaction.options.getSubcommand() === "remove") {
                if(!await devSchema.exists({ _id: user.id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} ${user} is not a developer!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                await devSchema.findOneAndDelete({ _id: user.id });

                const removed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} ${user} has been removed from the developer role.`)

                await interaction.editReply({ embeds: [removed] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("➖ Role Removed")
                    .addFields (
                        { name: "🎭 Role", value: "💻 Developer" },
                        { name: "👤 User", value: `${user}` }
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