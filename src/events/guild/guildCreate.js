const bannedGuildSchema = require("../../models/bannedGuildSchema");
const welcome = require("../../util/welcome");

module.exports = {
	name: "guildCreate",
	async execute(client, Discord, guild) {
        try {
            if(await bannedGuildSchema.exists({ _id: guild.id })) {
                guild.leave();
                console.log(`[ON ADD] Left Banned Guild: ${guild.id}`);
                return;
            }

            welcome(guild, client, Discord);
        } catch(err) {
			client.logEventError(err);
        }
    }
}