import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction, Interaction } from "discord.js";

import { createLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import Appeal from "../../models/Appeal";
import BannedUser from "../../models/BannedUser";

const button: Button = {
    name: "appeal-approve",
    startsWith: true,
    requiredRoles: ["mod"],
    async execute(interaction: ButtonInteraction, client: ExtendedClient & any, Discord: any) {
        try {
            const id = interaction.customId.replace("appeal-approve-", "");
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const data = await Appeal.findOne({ _id: id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This appeal does not exist!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(data.id === interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot manage your own appeal!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(data.status !== "NOT_REVIEWED") {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This appeal has already had a response!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle(`Approve Appeal: ${data._id}`)

            const modalReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-reason-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Reason")
                .setMaxLength(250)
                .setRequired(true)

            const row = new Discord.ActionRowBuilder().addComponents(modalReason);

            modal.addComponents(row);

            await interaction.showModal(modal);

            client.on("interactionCreate", async (i: Interaction) => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const reason = i.fields.getTextInputValue(`modal-reason-${interaction.id}`);

                    await BannedUser.findOneAndDelete({ _id: data.id });
                    await Appeal.findOneAndUpdate({ _id: id }, { status: "APPROVED", mod: interaction.user.id, reason: reason });

                    await createLog(data.id, data._id, "appealApprove", null, interaction.user.id);

                    const userDM = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.green)
                        .setTitle("✅ Appeal Approved")
                        .addFields (
                            { name: "❓ Reason", value: reason }
                        )
                        .setTimestamp()

                    let sentDM = false;

                    try {
                        const user = await client.users.fetch(data.id);
                        await user.send({ embeds: [userDM] });

                        sentDM = true;
                    } catch {}

                    const approved = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.green)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("✅ Approved")
                        .setDescription(reason)
                        .setTimestamp()

                    interaction.message.embeds.push(approved);

                    await interaction.message.edit({ embeds: interaction.message.embeds, components: [] });

                    await i.deferUpdate();

                    const appealLog = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("✅ Appeal Approved")
                        .addFields (
                            { name: "📄 Appeal", value: id },
                            { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                            { name: "❓ Reason", value: reason }
                        )
                        .setTimestamp()

                    modLogsChannel.send({ embeds: [appealLog] });
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}

export = button;
