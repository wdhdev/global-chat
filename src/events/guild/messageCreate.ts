import CustomClient from "../../classes/CustomClient";
import { Message } from "discord.js";

import send from "../../util/send";

import Guild from "../../models/Guild";

module.exports = {
    name: "messageCreate",
    async execute(client: CustomClient, Discord: any, message: Message) {
        try {
            const requiredPerms: any = ["SendMessages", "EmbedLinks", "ManageMessages"];

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
