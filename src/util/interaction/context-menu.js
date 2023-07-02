const emoji = require("../../config.json").emojis;

const bannedUserSchema = require("../../models/bannedUserSchema");

const cooldowns = new Map();

module.exports = async (client, Discord, interaction) => {
    try {
        if(await bannedUserSchema.exists({ _id: interaction.user.id })) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} You are banned from using the bot!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const command = client.contextCommands.get(interaction.commandName);

        if(!command) return;

        await interaction.deferReply({ ephemeral: true });

        if(!command.enabled) {
            const disabled = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} This command has been disabled!`)

            await interaction.editReply({ embeds: [disabled], ephemeral: true });
            return;
        }

        const validPermissions = client.validPermissions;

        if(command.botPermissions.length) {
            const invalidPerms = [];

            for(const perm of command.botPermissions) {
                if(!validPermissions.includes(perm)) return;

                if(!interaction.guild.members.me.permissions.has(perm)) {
                    invalidPerms.push(perm);
                }
            }

            if(invalidPerms.length) {
                const permError = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`I am missing these permissions: \`${invalidPerms.join("\`, \`")}\``)

                await interaction.editReply({ embeds: [permError], ephemeral: true });
                return;
            }
        }

        if(interaction.user.id === client.config_default.owner) {
            try {
                await command.execute(interaction, client, Discord);
                return;
            } catch(err) {
                client.logEventError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} There was an error while executing that command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }
        }

        if(!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());

        const currentTime = Date.now();
        const timeStamps = cooldowns.get(command.name);
        const cooldownAmount = command.cooldown * 1000;

        if(timeStamps.has(interaction.user.id)) {
            const expirationTime = timeStamps.get(interaction.member.id) + cooldownAmount;

            if(currentTime < expirationTime) {
                const timeLeft = ((expirationTime - currentTime) / 1000).toFixed(0);

                const cooldown = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`⏰ Please wait ${timeLeft} second${timeLeft === 1 ? "" : "s"} before running that command again!`)

                await interaction.editReply({ embeds: [cooldown], ephemeral: true });
                return;
            }
        }

        timeStamps.set(interaction.user.id, currentTime);

        setTimeout(() => {
            timeStamps.delete(interaction.user.id);
        }, cooldownAmount)

        try {
            await command.execute(interaction, client, Discord);
        } catch(err) {
            client.logEventError(err);

            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.error} There was an error while executing that command!`)

            await interaction.editReply({ embeds: [error], ephemeral: true });
        }
    } catch(err) {
        client.logEventError(err);
    }
}