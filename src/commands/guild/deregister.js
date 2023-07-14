const { PermissionFlagsBits } = require("discord.js");

const emoji = require("../../config").emojis;
const Guild = require("../../models/Guild");

module.exports = {
    name: "deregister",
    description: "Remove the global chat channel.",
    options: [],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 60,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: false,
    async execute(interaction, client, Discord) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            await Guild.findOneAndDelete({ _id: interaction.guild.id });

            const deregistered = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} The global chat channel has been deregistered.`)

            await interaction.editReply({ embeds: [deregistered] });

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("❌ Guild Deregistered")
                .addFields (
                    { name: "Name", value: interaction.guild.name, inline: true },
                    { name: "ID", value: interaction.guild.id.toString(), inline: true },
                    { name: "Responsible User", value: `${interaction.user}`, inline: true }
                )
                .setTimestamp()

            logsChannel.send({ embeds: [log] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
