import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { ButtonInteraction, Interaction } from "discord.js";

import { emojis as emoji } from "../../config";

import SentryCapture from "../../models/SentryCapture";

const button: Button = {
    name: "sentry-capture-info",
    startsWith: false,
    requiredRoles: new Roles(["dev"]),
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: any) {
        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal-${interaction.id}`)
            .setTitle("Get Token")

        const modalToken = new Discord.TextInputBuilder()
            .setCustomId(`modal-token-${interaction.id}`)
            .setStyle(Discord.TextInputStyle.Short)
            .setLabel("Sentry Capture Token")
            .setPlaceholder("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
            .setMinLength(36)
            .setMaxLength(36)
            .setRequired(true)

        const row = new Discord.ActionRowBuilder().addComponents(modalToken);

        modal.addComponents(row);

        await interaction.showModal(modal);

        client.on("interactionCreate", async (i: Interaction) => {
            if(!i.isModalSubmit()) return;

            if(i.customId === `modal-${interaction.id}`) {
                const token = i.fields.getTextInputValue(`modal-token-${interaction.id}`);

                const data = await SentryCapture.findOne({ _id: token });

                if(!data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} That token does not exist!`)

                    await i.reply({ embeds: [error], ephemeral: true });
                    return;
                }

                const tokenInfo = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("ℹ️ Token Information")
                    .addFields (
                        { name: "🔑 Token", value: token },
                        { name: "#️⃣ Channel", value: `<#${data.channel}>` },
                        { name: "🕰️ Registered", value: `<t:${data.registered.slice(0, -3)}> (<t:${data.registered.slice(0, -3)}:R>)` },
                        { name: "👤 Registered By", value: `<@${data.user}>` }
                    )

                await i.reply({ embeds: [tokenInfo], ephemeral: true });
            }
        })
    }
}

export = button;
