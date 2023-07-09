const emoji = require("../../config.json").emojis;

const Appeal = require("../../models/Appeal");
const BannedUser = require("../../models/BannedUser");

module.exports = {
    name: "submit-appeal",
    startsWith: false,
    requiredRoles: [],
    async execute(interaction, client, Discord) {
        try {
            if(!await BannedUser.exists({ _id: interaction.user.id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You are not banned!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(await BannedUser.exists({ _id: interaction.user.id, allowAppeal: false }) || await Appeal.exists({ id: interaction.user.id, status: "DENIED" })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You are allowed to submit an appeal!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(await Appeal.exists({ id: interaction.user.id, status: "NOT_REVIEWED" })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You already have created an appeal!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const id = require("crypto").randomUUID();

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${id}`)
                .setTitle("Ban Appeal")

            const modalBanReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-banreason-${id}`)
                .setStyle(Discord.TextInputStyle.Short)
                .setLabel("Why were you banned?")
                .setPlaceholder("I was banned for...")
                .setMinLength(5)
                .setMaxLength(100)
                .setRequired(true)

            const modalUnbanReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-unbanreason-${id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Why should you be unbanned?")
                .setPlaceholder("I should be unbanned because...")
                .setMinLength(30)
                .setMaxLength(250)
                .setRequired(true)

            const firstRow = new Discord.ActionRowBuilder().addComponents(modalBanReason);
            const secondRow = new Discord.ActionRowBuilder().addComponents(modalUnbanReason);

            modal.addComponents(firstRow, secondRow);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${id}`) {
                    const banReason = i.fields.getTextInputValue(`modal-banreason-${id}`);
                    const unbanReason = i.fields.getTextInputValue(`modal-unbanreason-${id}`);

                    const banData = await BannedUser.findOne({ _id: interaction.user.id });

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .addFields (
                            { name: "📄 Appeal", value: id },
                            { name: "👤 User", value: `${interaction.user}` },
                            { name: "🔨 Ban Reason (*actual reason*)", value: banData.reason ? `${banData.reason}` : "*None*" },
                            { name: "🔨 Ban Reason (*user provided*)", value: `${banReason}` },
                            { name: "🔓 Unban Reason (*user provided*)", value: `${unbanReason}` }
                        )

                    new Appeal({
                        _id: id,
                        id: interaction.user.id,
                        ban_reason: banReason,
                        unban_reason: unbanReason,
                        status: "NOT_REVIEWED"
                    }).save()

                    const appealsChannel = client.channels.cache.get(client.config_channels.appeals);

                    const actions = new Discord.ActionRowBuilder()
                        .addComponents (
                            new Discord.ButtonBuilder()
                                .setStyle(Discord.ButtonStyle.Success)
                                .setCustomId(`appeal-approve-${id}`)
                                .setLabel("Approve"),

                            new Discord.ButtonBuilder()
                                .setStyle(Discord.ButtonStyle.Danger)
                                .setCustomId(`appeal-deny-${id}`)
                                .setLabel("Deny")
                        )

                    await appealsChannel.send({ content: `<@&${client.config_roles.mod}>`, embeds: [embed], components: [actions] });

                    const created = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("Appeal Created")
                        .setDescription(`${emoji.tick} Your appeal has been created.`)
                        .addFields (
                            { name: "📄 ID", value: id }
                        )
                        .setTimestamp()

                    await i.reply({ embeds: [created], ephemeral: true });

                    try {
                        interaction.user.send({ embeds: [created] });
                    } catch {}
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
