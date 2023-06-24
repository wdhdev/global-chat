const { PermissionFlagsBits } = require("discord.js");

const emoji = require("../config.json").emojis;
const schema = require("../models/channelSchema");

module.exports = {
    name: "register",
    description: "Set the global chat channel.",
    options: [
        {
            type: 7,
            name: "channel",
            description: "The channel where global chat messages should be sent.",
            channel_types: [0],
            required: true
        }
    ],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: ["ManageMessages", "ManageWebhooks"],
    cooldown: 60,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            const channel = interaction.options.getChannel("channel");

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const webhook = await channel.createWebhook({
                name: "Global Chat",
                avatar: "https://avatars.githubusercontent.com/u/126386097"
            })

            if(!await schema.findOne({ _id: interaction.guild.id })) {
                new schema({
                    _id: interaction.guild.id,
                    channel: channel.id,
                    webhook: webhook.url
                }).save()

                const registerChannel = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} The global chat channel has been set to: ${channel}`)

                await interaction.editReply({ embeds: [registerChannel] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("📝 Guild Registered")
                    .addFields (
                        { name: "Name", value: `${interaction.guild.name}`, inline: true },
                        { name: "ID", value: `${interaction.guild.id}`, inline: true },
                        { name: "Responsible User", value: `${interaction.user}`, inline: true }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }

            await schema.findOneAndUpdate({ _id: interaction.guild.id }, { channel: channel.id, webhook: webhook.url });

            const channelChanged = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.successful} The global chat channel has been changed to: ${channel}`)

            await interaction.editReply({ embeds: [channelChanged] });

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🔄️ Guild Re-registered")
                .addFields (
                    { name: "Name", value: `${interaction.guild.name}`, inline: true },
                    { name: "ID", value: `${interaction.guild.id}`, inline: true },
                    { name: "Responsible User", value: `${interaction.user}`, inline: true }
                )
                .setTimestamp()

            logsChannel.send({ embeds: [log] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
