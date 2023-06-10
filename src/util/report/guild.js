module.exports = async (guild, reason, evidence, interaction, client, Discord) => {
    const emoji = require("../../config.json").emojis;
    const reportChannel = client.channels.cache.get(client.config_channels.reports);

    try {
        const report = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
            .setTitle("Guild Report")
            .addFields (
                { name: "Guild", value: guild },
                { name: "Reason", value: reason },
                { name: "Evidence", value: evidence }
            )

        reportChannel.send({ content: `<@&${client.config_roles.mod}>`, embeds: [report] });
    } catch(err) {
        console.error(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setDescription(`${emoji.error} An error occurred while submitting the report.`)

        await interaction.editReply({ embeds: [error], ephemeral: true });
        return;
    }

    const submitted = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.default)
        .setDescription(`${emoji.successful} Your report has been submitted.`)

    await interaction.editReply({ embeds: [submitted], ephemeral: true });
}