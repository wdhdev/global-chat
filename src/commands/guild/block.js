const { PermissionFlagsBits } = require("discord.js");

const emoji = require("../../config").emojis;

const Guild = require("../../models/Guild");
const User = require("../../models/User");

module.exports = {
    name: "block",
    description: "Block a user's messages sending to this guild.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user to block.",
            required: true
        }
    ],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const user = interaction.options.getUser("user");

            let data = await Guild.findOne({ _id: interaction.guild.id });
            const userData = await User.findOne({ _id: user.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This guild is not registered!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(data.blockedUsers.includes(user.id)) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That user is already blocked!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(userData?.dev || userData?.mod) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot block Global Chat staff!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(user.id === interaction.guild.ownerId) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot block the guild owner!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(user.bot) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot block bots!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(!data.blockedUsers) {
                Guild.findOneAndUpdate({ _id: interaction.guild.id }, { blockedUsers: [user.id] }, (err, data) => {});
            } else {
                data.blockedUsers.push(user.id);
                await data.save();
            }

            const blocked = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user} has been blocked!`)

            await interaction.editReply({ embeds: [blocked] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
