const emoji = require("../config.json").emojis;

const appealSchema = require("../models/appealSchema");
const bannedUserSchema = require("../models/bannedUserSchema");

module.exports = {
    name: "submit-appeal",
    startsWith: false,
    async execute(interaction, client, Discord) {
        try {
            if(!await bannedUserSchema.exists({ _id: interaction.user.id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You are not banned!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(!await bannedUserSchema.exists({ _id: interaction.user.id, allowAppeal: false })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You are allowed to submit an appeal!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(await appealSchema.exists({ id: interaction.user.id, status: "NOT_REVIEWED" })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You already have created an appeal!`)

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
                .setMaxLength(1024)
                .setRequired(true)

            const firstActionRow = new Discord.ActionRowBuilder().addComponents(modalBanReason);
            const secondActionRow = new Discord.ActionRowBuilder().addComponents(modalUnbanReason);

            modal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${id}`) {
                    const banReason = i.fields.getTextInputValue(`modal-banreason-${id}`);
                    const unbanReason = i.fields.getTextInputValue(`modal-unbanreason-${id}`);

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .addFields (
                            { name: "ID", value: id },
                            { name: "User", value: `<@${interaction.user.id}>` },
                            { name: "Ban Reason", value: `${banReason}` },
                            { name: "Unban Reason", value: `${unbanReason}` }
                        )

                    const data = new appealSchema({
                        _id: id,
                        id: interaction.user.id,
                        ban_reason: banReason,
                        unban_reason: unbanReason,
                        status: "NOT_REVIEWED"
                    })

                    await data.save();

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
                        .setDescription(`${emoji.successful} Your appeal has been created.\n\n**ID**: \`${id}\``)

                    await i.reply({ embeds: [created], ephemeral: true });
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}