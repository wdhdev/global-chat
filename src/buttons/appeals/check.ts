import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { ButtonInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

import Appeal from "../../models/Appeal";

const button: Button = {
    name: "check-appeal",
    startsWith: false,
    requiredRoles: new Roles([]),
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: any) {
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

            const firstRow = new Discord.ActionRowBuilder().addComponents(modalAppealId);

            modal.addComponents(firstRow);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const id = i.fields.getTextInputValue(`modal-appealid-${interaction.id}`);

                    const data = await Appeal.findOne({ _id: id });

                    if(!data) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.cross} That appeal does not exist!`)

                        await i.reply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    if(data.id !== interaction.user.id) {
                        const error = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.error)
                            .setDescription(`${emoji.cross} That appeal is not for your account!`)

                        await i.reply({ embeds: [error], ephemeral: true });
                        return;
                    }

                    const state: any = {
                        APPROVED: "🟢 Approved",
                        DENIED: "🔴 Denied",
                        NOT_REVIEWED: "🟠 Pending Review"
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

export = button;
