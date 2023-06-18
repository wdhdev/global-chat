const emoji = require("../config.json").emojis;

const appealSchema = require("../models/appealSchema");
const devSchema = require("../models/devSchema");
const modSchema = require("../models/modSchema");

module.exports = {
	name: "appeals",
	description: "Get all appeals related to a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's appeals to get.",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 10,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });

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

            const user = interaction.options.getUser("user");

            if(!await appealSchema.exists({ id: user.id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} This user has no appeals!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const state = {
                "APPROVED": emoji.green_circle,
                "DENIED": emoji.red_circle,
                "NOT_REVIEWED": emoji.orange_circle
            }

            const data = await appealSchema.find({ id: user.id });

            const appeals = [];

            for(const appeal of data) {
                appeals.push(`- ${state[appeal.status]} \`${appeal._id}\``);
            }

            const appealData = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? `@${user.username}` : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` })
                .setTitle("📄 Appeals")
                .setDescription(appeals.join("\n"))

            await interaction.editReply({ embeds: [appealData] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
