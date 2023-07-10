const emoji = require("../../config.json").emojis;

const Message = require("../../models/Message");
const User = require("../../models/User");

module.exports = {
	name: "Delete Message",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
	async execute(interaction, client, Discord) {
        try {
            const message = interaction.targetMessage;
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            if(!await Message.exists({ messages: message.url })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} No message was found with that ID!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await Message.findOne({ messages: message.url });

            const dev = await User.exists({ _id: interaction.user.id, dev: true });
            const mod = await User.exists({ _id: interaction.user.id, mod: true });

            if(!mod && !dev && data.user !== interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const total = data.messages.length;
            let deleted = 0;

            const promises = [];

            for(const message of data.messages) {
                promises.push(new Promise(async resolve => {
                    const info = message.replace("https://discord.com/channels/", "").split("/");

                    try {
                        const channel = await client.channels.fetch(info[1]);
                        const message = await channel.messages.fetch(info[2]);

                        await message.delete();

                        deleted++;
                        resolve(true);
                    } catch {
                        resolve(false);
                    }
                }))
            }

            Promise.all(promises).then(async () => {
                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} The message has been deleted!`)

                await interaction.editReply({ embeds: [result], ephemeral: true });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle(`🗑️ Message Deleted`)
                    .addFields (
                        { name: "💬 Message", value: `${data._id}` },
                        { name: "📄 Result", value: `Deleted ${deleted} of ${total} messages.` }
                    )
                    .setTimestamp()

                let user = null;

                try {
                    user = await client.users.fetch(data.user);
                } catch {}

                const message = new Discord.EmbedBuilder()
                    .setTimestamp(new Date(Number((BigInt(data._id) >> 22n) + 1420070400000n)))

                if(user) message.setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` });
                if(data.content) message.setDescription(data.content);

                modLogsChannel.send({ embeds: [log, message] });
            })
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}
