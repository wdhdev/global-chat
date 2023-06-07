const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");

module.exports = {
    name: "suggestion-deny",
    startsWith: false,
    async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });

            check:
            if(dev) {
                break check;
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to perform this action!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle("Deny Suggestion")

            const modalReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-reason-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Why should this suggestion be denied?")
                .setPlaceholder("This suggestion should be denied because...")
                .setMinLength(5)
                .setMaxLength(500)
                .setRequired(true)

            const actionRow = new Discord.ActionRowBuilder().addComponents(modalReason);

            modal.addComponents(actionRow);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const reason = i.fields.getTextInputValue(`modal-reason-${interaction.id}`);

                    const reply = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} The suggestion has been denied.`)

                    await i.reply({ embeds: [reply], ephemeral: true });

                    const denied = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.red)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("Denied")
                        .setDescription(`${reason}`)
                        .setTimestamp()

                    await interaction.message.edit({ embeds: [interaction.message.embeds[0], denied], components: [] });
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}