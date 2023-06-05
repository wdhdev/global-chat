const emoji = require("../config.json").emojis;

const modSchema = require("../models/modSchema");

module.exports = {
    name: "suggestion-delete",
    startsWith: true,
    async execute(interaction, client, Discord) {
        try {
        	const user = interaction.customId.replace("suggestion-delete-", "");

            if(interaction.user.id === user || await modSchema.exists({ _id: interaction.user.id })) {
                await interaction.message.delete();
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to delete this suggestion!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}