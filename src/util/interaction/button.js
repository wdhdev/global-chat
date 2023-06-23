const emoji = require("../../config.json").emojis;

module.exports = async function buttonInteraction(client, Discord, interaction) {
    try {
        const requiredPerms = ["SendMessages", "EmbedLinks"];

        if(!interaction.guild.members.me.permissions.has(requiredPerms)) return;
        if(!interaction.isButton()) return;

        const button = client.buttons.get(interaction.customId);

        if(button) {
            try {
                await button.execute(interaction, client, Discord);
            } catch(err) {
                client.logEventError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} There was an error while executing that button!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
            }

            return;
        }

        for (const btn of client.buttons) {
            if(interaction.customId.startsWith(btn[0]) && btn[1].startsWith) {
                try {
                    await btn[1].execute(interaction, client, Discord);
                } catch(err) {
                    client.logEventError(err);

                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} There was an error while executing that command!`)

                    await interaction.reply({ embeds: [error], ephemeral: true });
                }

                break;
            }
        }
    } catch(err) {
        client.logEventError(err);
    }
}
