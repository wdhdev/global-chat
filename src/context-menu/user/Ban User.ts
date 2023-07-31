import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import { Interaction, UserContextMenuCommandInteraction } from "discord.js";

import { cannotBanBots, cannotBanUser, cannotBanYourself } from "../../util/embeds";
import { createInfractionLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import BannedUser from "../../models/BannedUser";
import User from "../../models/User";

const command: ContextCommand = {
    name: "Ban User",
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

            if(user.id === interaction.user.id) return await interaction.reply({ embeds: [cannotBanYourself], ephemeral: true });

            if(user.bot) return await interaction.reply({ embeds: [cannotBanBots], ephemeral: true });

            if(await User.exists({ _id: user.id, immune: true })) return await interaction.reply({ embeds: [cannotBanUser], ephemeral: true });

            if(await BannedUser.exists({ _id: user.id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} is already banned!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle(`Ban ${user.tag.endsWith("#0") ? user.username : user.tag}`)

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

                    const menu = new Discord.StringSelectMenuBuilder()
                        .setCustomId(`select-menu-${interaction.id}`)
                        .setPlaceholder("Should this ban be appealable?")
                        .addOptions (
                            new Discord.StringSelectMenuOptionBuilder()
                                .setEmoji("✅")
                                .setLabel("Yes")
                                .setValue("true"),

                            new Discord.StringSelectMenuOptionBuilder()
                                .setEmoji("❌")
                                .setLabel("No")
                                .setValue("false")
                        )

                    const row = new Discord.ActionRowBuilder().addComponents(menu);

                    await i.reply({ components: [row], ephemeral: true });

                    client.on("interactionCreate", async (i2: Interaction) => {
                        if(!i2.isStringSelectMenu()) return;

                        if(i2.customId === `select-menu-${interaction.id}`) {
                            const appealable = i2.values[0];

                            await new BannedUser({
                                _id: user.id,
                                timestamp: Date.now(),
                                allowAppeal: appealable === "true" ? true : false,
                                reason: reason,
                                mod: interaction.user.id
                            }).save()

                            await createInfractionLog(user.id, null, "ban", interaction.user.id);

                            const ban = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setTitle("🔨 Ban")
                                .addFields (
                                    { name: "❓ Reason", value: reason },
                                    { name: "📜 Appealable", value: appealable ? "✅" : "❌" }
                                )
                                .setTimestamp()

                            if(appealable) {
                                ban.addFields (
                                    { name: "ℹ️ How to Appeal", value: "1. Join the [support server](https://discord.gg/globalchat).\n2. Go to the [appeal channel](https://discord.com/channels/1067023529226293248/1094505532267704331).\n3. Click \`Submit\` and fill in the form.\n4. Wait for a response to your appeal." }
                                )
                            }

                            let sentDM = false;

                            try {
                                await user.send({ embeds: [ban] });
                                sentDM = true;
                            } catch {}

                            const banned = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.default)
                                .setDescription(`${emoji.tick} ${user} has been banned.`)

                            await i.editReply({ embeds: [banned], components: [] });

                            const banLog = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.default)
                                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                                .setTitle("User Banned")
                                .addFields (
                                    { name: "👤 User", value: `${user}` },
                                    { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                                    { name: "❓ Reason", value: reason },
                                    { name: "📜 Appealable", value: appealable === "true" ? "✅" : "❌" }
                                )
                                .setTimestamp()

                            modLogsChannel.send({ embeds: [banLog] });
                        }
                    })
                }
            })
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

export = command;
