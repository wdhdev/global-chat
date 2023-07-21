import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { GuildMember } from "discord.js";

const event: Event = {
    name: "guildMemberUpdate",
    once: false,
    async execute(client: ExtendedClient & any, Discord: any, oldMember: GuildMember & any, newMember: GuildMember) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            const oldPremium = oldMember.premiumSince;
            const newPremium = newMember.premiumSince;

            if(oldMember.guild.id === client.config_main.primaryGuild && oldPremium !== newPremium) {
                if(!oldPremium && newPremium) {
                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: oldMember.guild.name, iconURL: oldMember.guild.iconURL({ extension: "png", forceStatic: false }) })
                        .setTitle("Role Added")
                        .addFields (
                            { name: "🎭 Role", value: "💖 Supporter" },
                            { name: "👤 User", value: `${oldMember}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                }

                if(!newPremium) {
                    const log = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: oldMember.guild.name, iconURL: oldMember.guild.iconURL({ extension: "png", forceStatic: false }) })
                        .setTitle("Role Removed")
                        .addFields (
                            { name: "🎭 Role", value: "💖 Supporter" },
                            { name: "👤 User", value: `${oldMember}` }
                        )
                        .setTimestamp()

                    logsChannel.send({ embeds: [log] });
                }
            }
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
