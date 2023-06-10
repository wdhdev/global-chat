const reportGuild = require("../util/report/guild");
const reportUser = require("../util/report/user");

module.exports = {
	name: "report",
	description: "Report a user or guild abusing the bot.",
    options: [
        {
            type: 1,
            name: "guild",
            description: "Report a guild abusing the bot.",
            options: [
                {
                    type: 3,
                    name: "guild",
                    description: "The Discord ID (recommended) or invite of the guild you want to report.",
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "The reason to why you want to report this guild.",
                    required: true
                },

                {
                    type: 3,
                    name: "evidence",
                    description: "Evidence of the user abusing the guild.",
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "user",
            description: "Report a user abusing the bot.",
            options: [
                {
                    type: 3,
                    name: "user",
                    description: "The Discord ID (recommended) or username of the user you want to report.",
                    required: true
                },

                {
                    type: 3,
                    name: "reason",
                    description: "The reason to why you want to report this user.",
                    required: true
                },

                {
                    type: 3,
                    name: "evidence",
                    description: "Evidence of the user abusing the bot.",
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 60,
    enabled: true,
    hidden: false,
	async execute(interaction, client, Discord) {
        try {
            if(interaction.options.getSubcommand() === "guild") {
                const guild = interaction.options.getString("guild");
                const reason = interaction.options.getString("reason");
                const evidence = interaction.options.getString("evidence");

                reportGuild(guild, reason, evidence, interaction, client, Discord);
                return;
            }

            if(interaction.options.getSubcommand() === "user") {
                const user = interaction.options.getString("user");
                const reason = interaction.options.getString("reason");
                const evidence = interaction.options.getString("evidence");

                reportUser(user, reason, evidence, interaction, client, Discord);
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}