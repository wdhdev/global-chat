const buttonInteraction = require("../../util/interaction/button");
const commandInteraction = require("../../util/interaction/command");

module.exports = {
	name: "interactionCreate",
	async execute(client, Discord, interaction) {
        try {
            const requiredPerms = ["SendMessages", "EmbedLinks"];

	        if(!interaction.guild) return;
            if(!interaction.guild.members.me.permissions.has(requiredPerms)) return;

            if(interaction.isButton()) return await buttonInteraction(client, Discord, interaction);
            if(interaction.isCommand()) return await commandInteraction(client, Discord, interaction);
        } catch(err) {
			client.logEventError(err);
        }
    }
}
