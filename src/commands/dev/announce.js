const announce = require("../../util/send").announce;
const emoji = require("../../config").emojis;

module.exports = {
    name: "announce",
    description: "[DEVELOPER ONLY] Make an announcement.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 60,
    enabled: true,
    staffOnly: true,
    deferReply: false,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle("Create Announcement")

            const modalText = new Discord.TextInputBuilder()
                .setCustomId(`modal-text-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Content")
                .setMinLength(10)
                .setMaxLength(2000)
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
                        .setDescription(`${emoji.tick} The announcement has been sent!`)

                    await i.reply({ embeds: [sent], components: [], ephemeral: true });
                }
            })
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
