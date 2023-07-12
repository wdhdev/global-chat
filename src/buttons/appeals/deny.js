const emoji = require("../../config").emojis;

const Appeal = require("../../models/Appeal");

module.exports = {
    name: "appeal-deny",
    startsWith: true,
    requiredRoles: ["mod"],
    async execute(interaction, client, Discord) {
        try {
            const id = interaction.customId.replace("appeal-deny-", "");
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
                .setTitle("Deny Appeal")

            const modalReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-reason-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Why should this appeal be denied?")
                .setPlaceholder("This appeal should be denied because...")
                .setMinLength(5)
                .setMaxLength(250)
                .setRequired(true)

            const row = new Discord.ActionRowBuilder().addComponents(modalReason);

            modal.addComponents(row);

            await interaction.showModal(modal);

            client.on("interactionCreate", async i => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const reason = i.fields.getTextInputValue(`modal-reason-${interaction.id}`);

                    await Appeal.findOneAndUpdate({ _id: id }, { status: "DENIED", mod: interaction.user.id, reason: reason });

                    const userDM = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.red)
                        .setTitle("❌ Appeal Denied")
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

                    const denied = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.red)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("❌ Denied")
                        .setDescription(reason)
                        .setTimestamp()

                    interaction.message.embeds.push(denied);

                    await interaction.message.edit({ embeds: interaction.message.embeds, components: [] });

                    await i.deferUpdate();

                    const appealLog = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                        .setTitle("❌ Appeal Denied")
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