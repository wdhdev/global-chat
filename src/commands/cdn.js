const cdnDelete = require("../util/cdn/delete");
const emoji = require("../config.json").emojis;

module.exports = {
    name: "cdn",
    description: "Manage your files on the CDN.",
    options: [
        {
            type: 1,
            name: "delete",
            description: "Delete a file you have uploaded to the CDN.",
            options: [
                {
                    type: 3,
                    name: "file",
                    description: "The name of the file you want to delete.",
                    min_length: 40,
                    max_length: 41,
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "terms",
            description: "Send a link to the CDN's terms and conditions.",
            options: []
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 30,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            if(interaction.options.getSubcommand() === "delete") {
                const file = interaction.options.getString("file");

                const res = await cdnDelete(client.token, file, interaction.user.id);

                if(res.status === 204) {
                    const deleted = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.successful} The file has been deleted from the CDN.`)

                    await interaction.editReply({ embeds: [deleted] });
                    return;
                }

                if(res.data.code === "NO_FILE_FOUND") {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} That file does not exist!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                return;
            }

            if(interaction.options.getSubcommand() === "terms") {
                const button = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Link)
                            .setLabel("Terms and Conditions")
                            .setURL("https://wdh.gg/gc-terms/cdn")
                    )
    
                await interaction.editReply({ components: [button] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}