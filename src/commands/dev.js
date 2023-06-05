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
            if(interaction.user.id !== "853158265466257448") {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const user = interaction.options.getUser("user");

            if(interaction.options.getSubcommand() === "add") {
                if(user.bot) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} You cannot add a bot to the developer role!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                devSchema.findOne({ _id: user.id }, async (err, data) => {
                    if(!data) {
                        data = new devSchema({ _id: user.id });

                        await data.save();

                        const added = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} ${user} has been added to the developer role.`)

                        await interaction.editReply({ embeds: [added] });
                        return;
                    }

                    if(data) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is already a developer!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }
                })
                return;
            }

            if(interaction.options.getSubcommand() === "remove") {
                devSchema.findOne({ _id: user.id }, async (err, data) => {
                    if(!data) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} ${user} is not a developer!`)

                        await interaction.editReply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    if(data) {
                        await data.delete();

                        const removed = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} ${user} has been removed from the developer role.`)

                        await interaction.editReply({ embeds: [removed] });
                        return;
                    }
                })
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}