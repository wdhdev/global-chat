const emoji = require("../../config.json").emojis;

const appealSchema = require("../../models/appealSchema");
const bannedUserSchema = require("../../models/bannedUserSchema");

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
    deferReply: true,
    ephemeral: false,
	async execute(interaction, client, Discord) {
        try {
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const id = interaction.options.getString("id");

            if(interaction.options.getSubcommand() === "delete") {
                if(!await appealSchema.exists({ _id: id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Please specify a valid appeal ID!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await appealSchema.findOneAndDelete({ _id: id });

                const deleted = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} The appeal has been deleted!`)

                await interaction.editReply({ embeds: [deleted] });

                const appealLog = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("🗑️ Appeal Deleted")
                    .addFields (
                        { name: "📄 Appeal", value: id }
                    )
                    .setTimestamp()

                modLogsChannel.send({ embeds: [appealLog] });
                return;
            }

            if(interaction.options.getSubcommand() === "get") {
                if(!await appealSchema.exists({ _id: id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Please specify a valid appeal ID!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const data = await appealSchema.findOne({ _id: id });
                const banData = await bannedUserSchema.findOne({ _id: data.id });

                const state = {
                    "APPROVED": "🟢 Approved",
                    "DENIED": "🔴 Denied",
                    "NOT_REVIEWED": "🟠 Pending Review"
                }

                const appealData = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "📄 Appeal", value: id },
                        { name: "👤 User", value: `<@${data.id}>` },
                        { name: "🔨 Ban Reason (*actual reason*)", value: banData.reason ? `${banData.reason}` : "*None*" },
                        { name: "🔨 Ban Reason (*user provided*)", value: `${data.ban_reason}` },
                        { name: "🔓 Unban Reason (*user provided*)", value: `${data.unban_reason}` },
                        { name: "📝 Status", value: `${state[data.status]}${data.status !== "NOT_REVIEWED" ? `\n❓ ${data.reason}\n🔨 <@${data.mod}>` : ""}` }
                    )

                await interaction.editReply({ embeds: [appealData] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
