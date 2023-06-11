const emoji = require("../config.json").emojis;

const appealSchema = require("../models/appealSchema");
const bannedUserSchema = require("../models/bannedUserSchema");
const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");

module.exports = {
	name: "appeal",
	description: "Appeal Management Commands",
    options: [
        {
            type: 1,
            name: "delete",
            description: "Delete an appeal.",
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
            description: "Get information about an appeal.",
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
    cooldown: 5,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            check:
            if(mod || dev) {
                break check;
            } else {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const id = interaction.options.getString("id");

            if(interaction.options.getSubcommand() === "delete") {
                if(!await appealSchema.exists({ _id: id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} Please specify a valid appeal ID!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                await appealSchema.findOneAndDelete({ _id: id });

                const deleted = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} The appeal has been deleted!`)

                await interaction.editReply({ embeds: [deleted] });

                const appealLog = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("🗑️ Appeal Deleted")
                    .addFields (
                        { name: "📄 Appeal", value: id },
                        { name: "🔨 Moderator", value: interaction.user }
                    )
                    .setTimestamp()

                modLogsChannel.send({ embeds: [appealLog] });
                return;
            }

            if(interaction.options.getSubcommand() === "get") {
                if(!await appealSchema.exists({ _id: id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} Please specify a valid appeal ID!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const data = await appealSchema.findOne({ _id: id });
                const banData = await bannedUserSchema.findOne({ _id: data.id });

                const state = {
                    "APPROVED": `${emoji.green_circle} Approved`,
                    "DENIED": `${emoji.red_circle} Denied`,
                    "NOT_REVIEWED": `${emoji.orange_circle} Pending Review`
                }

                const appealData = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "🔢 Appeal ID", value: id },
                        { name: "👤 User", value: `<@${data.id}>` },
                        { name: "🔨 Ban Reason", value: banData.reason ? banData.reason : "*None*" },
                        { name: "🔨 Ban Reason (*user provided*)", value: data.ban_reason },
                        { name: "🔓 Unban Reason (*user provided*)", value: data.unban_reason },
                        { name: "✏️ Status", value: `${state[data.status]}${data.status !== "NOT_REVIEWED" ? `\n🔨 <@${data.mod}>\n❓ ${data.reason}` : ""}` }
                    )

                await interaction.editReply({ embeds: [appealData] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}