import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { Guild } from "discord.js";

const event: Event = {
    name: "guildCreate",
    once: false,
    async execute(client: ExtendedClient & any, Discord: any, guild: Guild & any) {
        try {
            if(client.killSwitch) return;

            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Joined Guild")
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
