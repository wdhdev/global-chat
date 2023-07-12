const emoji = require("../../config").emojis;


const Guild = require("../../models/Guild");

module.exports = {
    name: "addchannel",
    description: "[DEV ONLY] Manually add channel.",
    options: [
        {
            type: 3,
            name: "channel",
            description: "The channel ID.",
            max_length: 1000,
            required: true
        },
        {
            type: 3,
            name: "guild",
            description: "The Guild ID.",
            max_length: 1000,
            required: true
        },
        {
            type: 3,
            name: "webhook",
            description: "The webhook.",
            max_length: 1000,
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 0,
    enabled: true,
    hidden: true,
    deferReply: true,
    ephemeral: false,
    async execute(interaction, client, Discord) {
        try {
            const input = interaction.options.getString("guild");
            const channel = interaction.options.getString("channel")
            const webhook = interaction.options.getString("webhook")

            

            try {
                new Guild({
                    _id: input,
                    channel: channel,
                    webhook: webhook
                }).save()

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "Output", value: `\`\`\`added to the DB\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result] });
            } catch(err) {
                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .addFields (
                        { name: "Input", value: `\`\`\`${input}\`\`\`` },
                        { name: "Output", value: `\`\`\`${err.message}\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result] });
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
