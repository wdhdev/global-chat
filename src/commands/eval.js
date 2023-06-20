const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");

module.exports = {
	name: "eval",
	description: "Evaluate code on the bot.",
    options: [
        {
            type: 3,
            name: "code",
            description: "The code you want to evaluate.",
            max_length: 1000,
            required: true
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

            const input = interaction.options.getString("code");

            async function isSecret(string) {
                for(const key in process.env) {
                    if(process.env[key] === string) return true;
                }

                return false;
            }

            try {
                const output = eval(input);

                if(await isSecret(output)) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.error} You cannot retrieve secret values!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "Input", value: `\`\`\`${input}\`\`\`` },
                        { name: "Output", value: `\`\`\`${output}\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result], ephemeral: true });
            } catch(err) {
                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .addFields (
                        { name: "Input", value: `\`\`\`${input}\`\`\`` },
                        { name: "Output", value: `\`\`\`${err.message}\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result], ephemeral: true });
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
