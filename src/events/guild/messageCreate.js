const Guild = require("../../models/Guild");
const send = require("../../util/send");

module.exports = {
    name: "messageCreate",
    async execute(client, Discord, message) {
        try {
            const requiredPerms = ["SendMessages", "EmbedLinks", "ManageMessages"];

            if(message.author.bot || !message.guild) return;
            if(!message.guild.members.me.permissions.has(requiredPerms)) return;

            if(await Guild.exists({ _id: message.guild.id, channel: message.channel.id })) {
                await send(message, client, Discord);
            }
        } catch(err) {
            client.logEventError(err);
        }
    }
}
