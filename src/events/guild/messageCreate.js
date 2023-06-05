const channelSchema = require("../../models/channelSchema");
const send = require("../../util/send");

module.exports = {
	name: "messageCreate",
	async execute(client, Discord, message) {
        try {
            if(message.author.bot || !message.guild) return;

            const requiredPerms = ["SendMessages", "EmbedLinks", "ManageMessages"];

            if(!message.guild.members.me.permissions.has(requiredPerms)) return;

            channelSchema.findOne({ _id: message.guild.id }, async (err, data) => {
                if(data && data.channel && data.channel === message.channel.id) {
                    send(message, client, Discord);
                }
            })
        } catch(err) {
            client.logEventError(err);
        }
    }
}