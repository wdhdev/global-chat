const emoji = require("../../config").emojis;

const Appeal = require("../../models/Appeal");
const BannedUser = require("../../models/BannedUser");

module.exports = {
    name: "appeal",
    description: "Appeal Management Commands",
    options: [
        {
            type: 1,
            name: "delete",
            description: "[MODERATOR ONLY] Delete an appeal.",
            options: [
                {
                    type: 3,
                    name: "id",
                    description: "The ID of the appeal.",
                    min_length: 36,
                    max_length: 36,
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "get",
            description: "[MODERATOR ONLY] Get information about an appeal.",
            options: [
                {
                    type: 3,
                    name: "id",
                    description: "The ID of the appeal.",
                    min_length: 36,
                    max_length: 36,
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 5,
    enabled: true,
    hidden: true,
    guildOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const id = interaction.options.getString("id");

            const appeal = await Appeal.findOne({ _id: id });

            if(interaction.options.getSubcommand() === "delete") {
                if(!appeal) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Please specify a valid appeal ID!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await appeal.delete();

                const deleted = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} The appeal has been deleted!`)

                await interaction.editReply({ embeds: [deleted] });

                const appealLog = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("🗑️ Appeal Deleted")
                    .addFields (
                        { name: "📄 Appeal", value: id }
                    )
                    .setTimestamp()

                modLogsChannel.send({ embeds: [appealLog] });
                return;
            }

            if(interaction.options.getSubcommand() === "get") {
                if(!appeal) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Please specify a valid appeal ID!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const banData = await BannedUser.findOne({ _id: appeal.id });

                const state = {
                    "APPROVED": "🟢 Approved",
                    "DENIED": "🔴 Denied",
                    "NOT_REVIEWED": "🟠 Pending Review"
                }

                const appealData = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "📄 Appeal", value: id },
                        { name: "👤 User", value: `<@${appeal.id}>` },
                        { name: "🔨 Ban Reason (*actual reason*)", value: banData.reason ? `${banData.reason}` : "*None*" },
                        { name: "🔨 Ban Reason (*user provided*)", value: `${appeal.ban_reason}` },
                        { name: "🔓 Unban Reason (*user provided*)", value: `${appeal.unban_reason}` },
                        { name: "📝 Status", value: `${state[appeal.status]}${appeal.status !== "NOT_REVIEWED" ? `\n❓ ${appeal.reason}\n🔨 <@${appeal.mod}>` : ""}` }
                    )

                await interaction.editReply({ embeds: [appealData] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
