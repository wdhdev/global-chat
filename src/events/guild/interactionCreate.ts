import CustomClient from "../../classes/CustomClient";
import { Interaction } from "discord.js";

import buttonHandler from "../../util/interaction/button";
import commandHandler from "../../util/interaction/command";
import contextCommandHandler from "../../util/interaction/context-menu";

export = {
    name: "interactionCreate",
    async execute(client: CustomClient, Discord: any, interaction: Interaction) {
        try {
            const requiredPerms: Array<any> = ["SendMessages", "EmbedLinks"];

            if(!interaction.guild) return;
            if(!interaction.guild.members.me.permissions.has(requiredPerms)) return;

            if(interaction.isButton()) return await buttonHandler(client, Discord, interaction);
            if(interaction.isCommand() && !interaction.isMessageContextMenuCommand() && !interaction.isUserContextMenuCommand()) return await commandHandler(client, Discord, interaction);
            if(interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) return await contextCommandHandler(client, Discord, interaction);
        } catch(err) {
            client.logError(err);
        }
    }
}
