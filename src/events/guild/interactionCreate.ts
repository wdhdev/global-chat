import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { Interaction, PermissionResolvable } from "discord.js";

import buttonHandler from "../../util/interaction/button";
import commandHandler from "../../util/interaction/command";
import contextCommandHandler from "../../util/interaction/context-menu";
import getRoles from "../../functions/roles/get";

const event: Event = {
    name: "interactionCreate",
    once: false,
    async execute(client: ExtendedClient, Discord: any, interaction: Interaction) {
        try {
            const userRoles = await getRoles(interaction.user.id, client);

            if(client.killSwitch && !userRoles.staff) return;

            const requiredPerms: PermissionResolvable = ["SendMessages", "EmbedLinks"];

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

export = event;
