const emoji = require("../../config").emojis;
const getWebhook = require("../../util/webhooks/get");

const Guild = require("../../models/Guild");

module.exports = {
    name: "manual-register",
    description: "[DEVELOPER ONLY] Manually register a Global Chat channel using a webhook URL.",
    options: [
        {
            type: 3,
            name: "webhook",
            description: "The URL of the webhook.",
            min_length: 121,
            max_length: 121,
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["dev"],
    cooldown: 0,
    enabled: true,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const webhook = interaction.options.getString("webhook");

            const data = await getWebhook(webhook);

            if(data.code && data.message) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Please use a valid webhook URL!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const guildData = await Guild.findOne({ _id: data.guild_id });

            if(!guildData) {
                new Guild({
                    _id: data.guild_id,
                    channel: data.channel_id,
                    webhook: webhook
                }).save()

                const added = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} The guild \`${data.guild_id}\` has been registered with the specified webhook!`)

                await interaction.editReply({ embeds: [added] });
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} The guild \`${data.guild_id}\` is already registered!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
