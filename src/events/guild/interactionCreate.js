const buttonHandler = require("../../util/interaction/button");
const commandHandler = require("../../util/interaction/command");
const contextCommandHandler = require("../../util/interaction/context-menu");

module.exports = {
    name: "interactionCreate",
    async execute(client, Discord, interaction) {
        try {
            const requiredPerms = ["SendMessages", "EmbedLinks"];

            if(!interaction.guild) return;
            if(!interaction.guild.members.me.permissions.has(requiredPerms)) return;

            if(interaction.isButton()) return await buttonHandler(client, Discord, interaction);
            if(interaction.isCommand() && !interaction.isMessageContextMenuCommand() && !interaction.isUserContextMenuCommand()) return await commandHandler(client, Discord, interaction);
            if(interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) return await contextCommandHandler(client, Discord, interaction);
        } catch(err) {
            client.logEventError(err);
        }
    }
}
