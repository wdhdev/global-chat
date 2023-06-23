const buttonInteraction = require("../../util/interaction/button");
const commandInteraction = require("../../util/interaction/command");

module.exports = {
	name: "interactionCreate",
	async execute(client, Discord, interaction) {
        try {
            if(interaction.isButton()) return await buttonInteraction(client, Discord, interaction);
            if(interaction.isCommand()) return await commandInteraction(client, Discord, interaction);
        } catch(err) {
			client.logEventError(err);
        }
    }
}
