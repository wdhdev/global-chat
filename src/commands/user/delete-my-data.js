const emoji = require("../../config").emojis;

const User = require("../../models/User");

module.exports = {
    name: "delete-my-data",
    description: "Delete all data associated with your account.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 120,
    enabled: true,
    hidden: false,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            if(!await User.exists({ _id: interaction.user.id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There is no data associated with your account!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const embed = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Confirmation")
                .setDescription("Are you sure you want to delete all data associated with your account?\n\nEverything including your **roles** will be removed.\n**This cannot be undone.**")
                .setTimestamp()

            const actions = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setCustomId(`delete-${interaction.id}`)
                        .setLabel("Confirm"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setCustomId(`cancel-${interaction.id}`)
                        .setLabel("Cancel")
                )

            await interaction.editReply({ embeds: [embed], components: [actions] })
            const collector = interaction.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 30000 });

            collector.on("collect", async c => {
                if(c.user.id !== interaction.user.id) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} This button is not for you!`)

                    c.reply({ embeds: [error], ephemeral: true });
                    return;
                }

                if(c.customId === `delete-${interaction.id}`) {
                    collector.stop();

                    await User.findOneAndDelete({ _id: interaction.user.id });

                    const deleted = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} All of your data has been deleted!`)

                    await interaction.editReply({ embeds: [deleted], components: [] });
                    return;
                }

                if(c.customId === `cancel-${interaction.id}`) {
                    collector.stop();

                    const cancelled = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Operation cancelled.`)

                    await interaction.editReply({ embeds: [cancelled], components: [] });
                    return;
                }
            })

            collector.on("end", async collected => {
                let validInteractions = [];

                collected.forEach(c => {
                    if(c.user.id === interaction.user.id) validInteractions.push(c);
                })

                if(validInteractions.length == 0) {
                    const cancelled = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Operation cancelled.`)

                    await interaction.editReply({ embeds: [cancelled] });
                }
            })
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
