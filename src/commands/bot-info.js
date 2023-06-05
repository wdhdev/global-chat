const bot = require("../../package.json");
const emoji = require("../config.json").emojis;

module.exports = {
    name: "bot-info",
    description: "Get information about the bot.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            // Uptime
            let totalSeconds = (client.uptime / 1000);

            let days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400; 
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = Math.floor(totalSeconds % 60);

            let uptime_days = days === 1 ? `${days} day` : `${days} days`;
            let uptime_hours = hours === 1 ? `${hours} hour` : `${hours} hours`;
            let uptime_minutes = minutes === 1 ? `${minutes} minute` : `${minutes} minutes`;
            let uptime_seconds = seconds === 1 ? `${seconds} second` : `${seconds} seconds`;

            let uptime = `${uptime_days}, ${uptime_hours}, ${uptime_minutes}, ${uptime_seconds}`;

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
            	.setTitle("Bot Information")
            	.setDescription(`
                    **Username**
					${emoji.reply} ${client.user.username}
                    **ID**
					${emoji.reply} ${client.user.id}
                    **Version**
                    ${emoji.reply} v${bot.version}
                    **Developer**
                    ${emoji.reply} ${bot.author}
                    **Uptime**
                    ${emoji.reply} ${uptime}
                    **Guild Count**
                    ${emoji.reply} ${client.guilds.cache.size} ${client.guilds.cache.size === 1 ? "Guild" : "Guilds"}
                    **User Count**
                    ${emoji.reply} ${client.users.cache.size} ${client.users.cache.size === 1 ? "User" : "Users"}
				`)

            await interaction.editReply({ embeds: [info] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}