const emoji = require("../../config").emojis;
const getRoles = require("../roles/get");

module.exports = async (client, Discord, interaction) => {
    try {
        const button = client.buttons.get(interaction.customId);

        if(button) {
            const requiredRoles = button.requiredRoles;
            const userRoles = await getRoles(interaction.user.id, client);

            if(requiredRoles.length) {
                const hasRoles = [];

                for(const role of requiredRoles) {
                    if(userRoles[role]) hasRoles.push(role);
                }

                if(requiredRoles.length !== hasRoles.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You do not have permission to run this button!`)

                    await interaction.reply({ embeds: [error], ephemeral: true });
                    return;
                }
            }

            try {
                await button.execute(interaction, client, Discord);
            } catch(err) {
                client.logError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There was an error while executing that button!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
            }

            return;
        }

        for (const btn of client.buttons) {
            if(interaction.customId.startsWith(btn[0]) && btn[1].startsWith) {
                const requiredRoles = btn[1].requiredRoles;
                const userRoles = await getRoles(interaction.user.id, client);

                if(requiredRoles.length) {
                    const hasRoles = [];

                    for(const role of requiredRoles) {
                        if(userRoles[role]) hasRoles.push(role);
                    }

                    if(requiredRoles.length !== hasRoles.length) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.cross} You do not have permission to run this button!`)

                        await interaction.reply({ embeds: [error], ephemeral: true });
                        return;
                    }
                }

                try {
                    await btn[1].execute(interaction, client, Discord);
                } catch(err) {
                    client.logError(err);

                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There was an error while executing that button!`)

                    await interaction.reply({ embeds: [error], ephemeral: true });
                }

                break;
            }
        }
    } catch(err) {
        client.logError(err);
    }
}
