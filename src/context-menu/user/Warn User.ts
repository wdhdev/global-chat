import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import { Interaction, UserContextMenuCommandInteraction } from "discord.js";

import { cannotWarnBots, cannotWarnUser, cannotWarnYourself } from "../../util/embeds";
import { emojis as emoji } from "../../config";
import warn from "../../functions/warn";

import User from "../../models/User";

const command: ContextCommand = {
    name: "Warn User",
    type: 2,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: true,
    deferReply: false,
    ephemeral: true,
    async execute(interaction: UserContextMenuCommandInteraction, client: ExtendedClient & any, Discord: any) {
        try {
            const user = interaction.targetUser;

            if(user.id === interaction.user.id) return await interaction.reply({ embeds: [cannotWarnYourself], ephemeral: true });

            if(user.bot) return await interaction.reply({ embeds: [cannotWarnBots], ephemeral: true });

            if(await User.exists({ _id: user.id, immune: true })) return await interaction.reply({ embeds: [cannotWarnUser], ephemeral: true });

            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle(`Warn ${user.tag.endsWith("#0") ? user.username : user.tag}`)

            const modalReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-reason-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Short)
                .setLabel("Reason")
                .setMaxLength(100)
                .setRequired(true)

            const row = new Discord.ActionRowBuilder().addComponents(modalReason);

            modal.addComponents(row);

            await interaction.showModal(modal);

            client.on("interactionCreate", async (i: Interaction) => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const reason = i.fields.getTextInputValue(`modal-reason-${interaction.id}`);

                    const id = await warn(user.id, reason, interaction.user.id);

                    const warning = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setTitle("⚠️ Warning")
                        .addFields (
                            { name: "❓ Reason", value: reason }
                        )
                        .setTimestamp()

                    let sentDM = false;

                    try {
                        await user.send({ embeds: [warning] });
                        sentDM = true;
                    } catch {}

                    const warned = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} ${user} has been warned.`)

                    await i.reply({ embeds: [warned], ephemeral: true });

                    const warnLog = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("User Warned")
                        .addFields (
                            { name: "📄 ID", value: `\`${id}\`` },
                            { name: "👤 User", value: `${user}` },
                            { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                            { name: "❓ Reason", value: reason }
                        )
                        .setTimestamp()

                    modLogsChannel.send({ embeds: [warnLog] });
                }
            })
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

export = command;
