import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { Guild as GuildType } from "discord.js";

import checkWebhook from "../../functions/webhooks/check";
import fetch from "node-fetch";

import Guild from "../../models/Guild";

const event: Event = {
    name: "guildDelete",
    once: false,
    async execute(client: ExtendedClient & any, Discord: typeof import("discord.js"), guild: GuildType & any) {
        try {
            if(client.killSwitch) return;

            const data = await Guild.findOne({ _id: guild.id });

            if(data) {
                if(await checkWebhook(data.webhook)) await fetch(data.webhook, { method: "DELETE" });

                await data.deleteOne();
            }

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Left Guild")
                .setThumbnail(guild.iconURL({ extension: "png", forceStatic: false }))
                .addFields (
                    { name: "Name", value: `${guild.name}`, inline: true },
                    { name: "ID", value: guild.id, inline: true },
                    { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
                    { name: "Created", value: `<t:${guild.createdTimestamp.toString().slice(0, -3)}> (<t:${guild.createdTimestamp.toString().slice(0, -3)}:R>)`, inline: true },
                    { name: "Member Count", value: `${guild.memberCount}`, inline: true }
                )
                .setTimestamp()

            logsChannel.send({ embeds: [log] });
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
