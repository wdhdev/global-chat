const bot = require("../../package.json");
const moment = require("moment");

module.exports = {
    name: "bot",
    description: "Different information about the bot.",
    options: [
        {
            type: 1,
            name: "info",
            description: "Get information about the bot.",
            options: []
        },

        {
            type: 1,
            name: "uptime",
            description: "Get the bot's uptime.",
            options: []
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            // Uptime
            let totalSeconds = (client.uptime / 1000);

            const days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400; 
            const hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60);

            const uptime_days = days === 1 ? `${days} day` : `${days} days`;
            const uptime_hours = hours === 1 ? `${hours} hour` : `${hours} hours`;
            const uptime_minutes = minutes === 1 ? `${minutes} minute` : `${minutes} minutes`;
            const uptime_seconds = seconds === 1 ? `${seconds} second` : `${seconds} seconds`;

            const uptime = `${uptime_days}, ${uptime_hours}, ${uptime_minutes}, ${uptime_seconds}`;

            if(interaction.options.getSubcommand() === "info") {
                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Bot Information")
                    .addFields (
                        { name: "Name", value: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, inline: true },
                        { name: "ID", value: client.user.id, inline: true },
                        { name: "Version", value: `v${bot.version}`, inline: true },
                        { name: "Developer", value: `${bot.author}`, inline: true },
                        { name: "Online Since", value: `<t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:R>`, inline: true },
                        { name: "Statistics", value: `Guilds: ${client.guilds.cache.size}\nUsers: ${client.users.cache.size}`, inline: true }
                    )

                await interaction.editReply({ embeds: [info] });
                return;
            }

            if(interaction.options.getSubcommand() === "uptime") {
                const uptimeInfo = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Uptime")
                    .setDescription(`${uptime} [<t:${Math.floor(moment(Date.now() - client.uptime) / 1000)}:R>]`)

                await interaction.editReply({ embeds: [uptimeInfo] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
