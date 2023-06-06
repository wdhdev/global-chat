const channelSchema = require("../../models/channelSchema");
const checkWebhook = require("../../util/checkWebhook");
const noWelcomeSchema = require("../../models/noWelcomeSchema");

module.exports = {
	name: "guildDelete",
	async execute(client, guild) {
        try {
            if(await channelSchema.exists({ _id: guild.id })) {
                const data = await channelSchema.findOne({ _id: guild.id });
                const valid = await checkWebhook(data.webhook);

                if(valid) await axios.delete(data.webhook);
            }

            await channelSchema.findOneAndDelete({ _id: guild.id });
            await noWelcomeSchema.findOneAndDelete({ _id: guild.id });
        } catch(err) {
			client.logEventError(err);
        }
    }
}
