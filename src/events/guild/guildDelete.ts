import ExtendedClient from "../../classes/ExtendedClient";
import { Guild as GuildType } from "discord.js";

import checkWebhook from "../../util/webhooks/check";
import fetch from "node-fetch";

import Guild from "../../models/Guild";

export = {
    name: "guildDelete",
    async execute(client: ExtendedClient & any, Discord: any, guild: GuildType & any) {
        try {
            const data = await Guild.findOne({ _id: guild.id });

            if(data) {
                if(await checkWebhook(data.webhook)) await fetch(data.webhook, { method: "DELETE" });

                await data.delete();
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
