const emoji = require("../../config.json").emojis;

const BannedUser = require("../../models/BannedUser");

module.exports = {
    name: "unban",
    description: "[MODERATOR ONLY] Unban a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user you want to unban.",
            required: true
        },

        {
            type: 3,
            name: "reason",
            description: "Why you want to unban the user.",
            max_length: 250,
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    hidden: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const user = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason");

            const data = await BannedUser.findOne({ _id: user.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} is not banned!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            await data.delete();

            const userDM = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.green)
                .setTitle("Unbanned")
                .setDescription(`${emoji.tick} You have been unbanned from Global Chat.`)
                .addFields (
                    { name: "❓ Reason", value: reason }
                )
                .setTimestamp()

            let sentDM = false;

            try {
                await user.send({ embeds: [userDM] });

                sentDM = true;
            } catch {}

            const unbanned = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user} has been unbanned.`)

            await interaction.editReply({ embeds: [unbanned] });

            const banLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("User Unbanned")
                .addFields (
                    { name: "👤 User", value: `${user}` },
                    { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                    { name: "❓ Reason", value: reason }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [banLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}