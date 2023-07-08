const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");

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
                    .setDescription(`${emoji.cross} You do not have permission to perform this action!`)

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
                .setMaxLength(250)
                .setRequired(true)

            const row = new Discord.ActionRowBuilder().addComponents(modalReason);

            modal.addComponents(row);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const reason = i.fields.getTextInputValue(`modal-reason-${interaction.id}`);

                    const denied = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.red)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("❌ Denied")
                        .setDescription(`${reason}`)
                        .setTimestamp()

                    interaction.message.embeds.push(denied);

                    await interaction.message.edit({ embeds: interaction.message.embeds, components: [] });

                    await i.deferUpdate();
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}