import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { announce } from "../../util/send";
import { emojis as emoji } from "../../config";

const command: Command = {
    name: "announce",
    description: "[DEVELOPER ONLY] Make an announcement.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 60,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: false,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
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

export = command;
