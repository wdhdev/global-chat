const { PermissionFlagsBits } = require("discord.js");

const emoji = require("../../config").emojis;

const Guild = require("../../models/Guild");

module.exports = {
    name: "blocked",
    description: "Get a list of all the guild's blocked users.",
    options: [],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    hidden: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const data = await Guild.findOne({ _id: interaction.guild.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This guild is not registered!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(!data.blockedUsers.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This guild has not blocked any users!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const blocked = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.red)
                .setTitle("⛔ Blocked Users")
                .setDescription(`<@${data.blockedUsers.join(">, <@")}>`)

            await interaction.editReply({ embeds: [blocked] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
