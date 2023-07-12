const { PermissionFlagsBits } = require("discord.js");

const checkWebhook = require("../../util/webhooks/check");
const emoji = require("../../config").emojis;
const fetch = require("node-fetch");

const Guild = require("../../models/Guild");

module.exports = {
    name: "delete-guild-data",
    description: "Delete all data associated with the current guild.",
    options: [],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 120,
    enabled: true,
    hidden: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const data = await Guild.findOne({ _id: interaction.guild.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There is no data associated with this guild!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const confirmation = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Confirmation")
                .setDescription("Are you sure you want to delete all data associated with this guild?\n\nThe global chat channel will be **deregistered** and any webhooks will be **deleted**.\n**This cannot be undone.**")
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

            await interaction.editReply({ embeds: [confirmation], components: [actions] })
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

                    if(data.webhook) {
                        if(await checkWebhook(data.webhook)) fetch(data.webhook, { method: "DELETE" });
                    }

                    await data.delete();

                    const deleted = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} All of this guild's data has been deleted!`)

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
