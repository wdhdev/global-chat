const emoji = require("../config.json").emojis;

const appealSchema = require("../models/appealSchema");
const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");

module.exports = {
    name: "appeal-deny",
    startsWith: true,
    async execute(interaction, client, Discord) {
        try {
            const id = interaction.customId.replace("appeal-deny-", "");
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });

            check:
            if(mod || dev) {
                break check;
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to perform this action!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await appealSchema.findOne({ _id: id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} This appeal does not exist!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(data.id === interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You cannot manage your own appeal!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(data.status !== "NOT_REVIEWED") {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} This appeal has already had a response!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle("Deny Appeal")

            const modalReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-reason-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Why should this appeal be denied?")
                .setPlaceholder("This appeal should be denied because...")
                .setMinLength(5)
                .setMaxLength(250)
                .setRequired(true)

            const actionRow = new Discord.ActionRowBuilder().addComponents(modalReason);

            modal.addComponents(actionRow);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const reason = i.fields.getTextInputValue(`modal-reason-${interaction.id}`);

                    await appealSchema.findOneAndUpdate({ _id: id }, { status: "DENIED", mod: interaction.user.id, reason: reason });

                    const userDM = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.red)
                        .setTitle("Appeal Denied")
                        .setDescription(`${emoji.error} Your appeal has been denied and you have not been unbanned from Global Chat.`)
                        .setTimestamp()

                    let sentDM = false;

                    try {
                        const user = await client.users.fetch(data.id);
                        await user.send({ embeds: [userDM] });

                        sentDM = true;
                    } catch {}

                    const denied = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.red)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("Denied")
                        .setDescription(`${reason}`)
                        .setTimestamp()

                    await interaction.message.edit({ embeds: [interaction.message.embeds[0], denied], components: [] });

                    const reply = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} The appeal has been denied.`)

                    await i.reply({ embeds: [reply], ephemeral: true });

                    const appealLog = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("Appeal Denied")
                        .addFields (
                            { name: "📄 Appeal", value: id },
                            { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                            { name: "❓ Reason", value: `${reason}` },
                            { name: "🔨 Moderator", value: `${interaction.user}` }
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