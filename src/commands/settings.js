const { PermissionFlagsBits } = require("discord.js");

const emoji = require("../config.json").emojis;
const welcomeSchema = require("../models/welcomeSchema");

module.exports = {
	name: "settings",
	description: "Guild Settings",
    options: [
        {
            type: 1,
            name: "welcome_messages",
            description: "Toggle welcome messages being enabled or disabled."
        }
    ],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    cooldown: 60,
    enabled: true,
    hidden: false,
	async execute(interaction, client, Discord) {
        try {
            if(interaction.options.getSubcommand() === "welcome_messages") {
                if(await welcomeSchema.exists({ _id: interaction.guild.id })) {
                    await welcomeSchema.findOneAndDelete({ _id: interaction.guild.id });

                    const done = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} Welcome messages have been enabled!`)

                    await interaction.editReply({ embeds: [done] });
                } else {
                    data = new welcomeSchema({ _id: interaction.guild.id });

                    await data.save();

                    const done = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} Welcome messages have been disabled!`)

                    await interaction.editReply({ embeds: [done] });
                }
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}