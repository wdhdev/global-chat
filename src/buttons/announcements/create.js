const announce = require("../../util/announcement");
const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");

module.exports = {
    name: "create-announcement",
    startsWith: false,
    async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });

            if(!dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle("Create Announcement")

            const modalText = new Discord.TextInputBuilder()
                .setCustomId(`modal-text-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Content")
                .setMinLength(10)
                .setMaxLength(1000)
                .setRequired(true)

            const row = new Discord.ActionRowBuilder().addComponents(modalText);

            modal.addComponents(row);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const text = i.fields.getTextInputValue(`modal-text-${interaction.id}`);

                    await announce(text, interaction, client, Discord);

                    const sent = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} The announcement has been sent!`)

                    await interaction.message.edit({ embeds: [sent], components: [], ephemeral: true });

                    await i.deferUpdate();
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
