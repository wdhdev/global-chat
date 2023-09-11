import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { Message, PermissionResolvable } from "discord.js";

import send from "../../util/send";

import Guild from "../../models/Guild";
import killswitch from "../../models/killswitch";

const event: Event = {
    name: "messageCreate",
    once: false,
    async execute(client: ExtendedClient, Discord: any, message: Message) {
        try {
            const killswitchData = await killswitch.findOne({ killswitch: false });
            if (!killswitchData) return;
            const requiredPerms: PermissionResolvable = ["SendMessages", "EmbedLinks", "ManageMessages"];

            if(message.author.bot || !message.guild) return;
            if(!message.guild.members.me.permissions.has(requiredPerms)) return;

            if(await Guild.exists({ _id: message.guild.id, channel: message.channel.id })) {
                await send(message, client, Discord);
            }
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
