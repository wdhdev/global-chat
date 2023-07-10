const { PermissionFlagsBits } = require("discord.js");

const emoji = require("../../config.json").emojis;

const Guild = require("../../models/Guild");

module.exports = {
    name: "unblock",
    description: "Unblock a user's messages sending to this guild.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user to unblock.",
            required: true
        }
    ],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    hidden: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const user = interaction.options.getUser("user");

            let data = await Guild.findOne({ _id: interaction.guild.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This guild is not registered!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(!data.blockedUsers.includes(user.id)) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That user is not blocked!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            data.blockedUsers = data.blockedUsers.filter(item => item !== user.id);

            await data.save();

            const unblocked = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user} has been unblocked!`)

            await interaction.editReply({ embeds: [unblocked] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
