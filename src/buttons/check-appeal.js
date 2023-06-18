const emoji = require("../config.json").emojis;

const appealSchema = require("../models/appealSchema");

module.exports = {
    name: "check-appeal",
    startsWith: false,
    async execute(interaction, client, Discord) {
        try {
            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle("Check Appeal")

            const modalAppealId = new Discord.TextInputBuilder()
                .setCustomId(`modal-appealid-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Short)
                .setLabel("What is your appeal ID?")
                .setPlaceholder("xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx")
                .setMinLength(36)
                .setMaxLength(36)
                .setRequired(true)

            const firstActionRow = new Discord.ActionRowBuilder().addComponents(modalAppealId);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const id = i.fields.getTextInputValue(`modal-appealid-${interaction.id}`);

                    if(!await appealSchema.exists({ _id: id })) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} That appeal does not exist!`)

                        await i.reply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const data = await appealSchema.findOne({ _id: id });

                    if(data.id !== interaction.user.id) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.error} That appeal is not for your account!`)

                        await i.reply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const state = {
                        "APPROVED": `${emoji.green_circle} Approved`,
                        "DENIED": `${emoji.red_circle} Denied`,
                        "NOT_REVIEWED": `${emoji.orange_circle} Pending Review`
                    }

                    const appealData = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("Your Appeal")
                        .addFields (
                            { name: "📄 ID", value: id },
                            { name: "📝 Status", value: `${state[data.status]}` }
                        )

                    if(data.status !== "NOT_REVIEWED") {
                        appealData.addFields (
                            { name: "❓ Reason", value: `${data.reason}` }
                        )
                    }

                    await i.reply({ embeds: [appealData], ephemeral: true });
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}