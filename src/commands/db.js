const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");

module.exports = {
	name: "db",
	description: "Manage the bot's database.",
    options: [
        {
            type: 1,
            name: "clean",
            description: "Clean up a specific collection in the database.",
            options: [
                {
                    type: 3,
                    name: "collection",
                    description: "The collection to clean up.",
                    choices: [
                        {
                            name: "channels",
                            description: "Clean up the channels collection.",
                            value: "channels"
                        }
                    ],
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });

            if(!dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(interaction.options.getSubcommand() === "clean") {
                const collection = interaction.options.getString("collection");

                if(collection === "channels") {
                    const cleanChannels = require("../util/database/cleanChannels");

                    const res = await cleanChannels(client);

                    const result = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} Cleared the \`channels\` collection!`)
                        .addFields (
                            { name: "Removed Documents", value: res.length ? `\`\`\`${res.join("\n")}\`\`\`` : "*None*" }
                        )

                    await interaction.editReply({ embeds: [result], ephemeral: true });
                    return;
                }

                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}