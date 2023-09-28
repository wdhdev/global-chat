import ExtendedClient from "../classes/ExtendedClient";

import { AttachmentBuilder, EmbedBuilder, PermissionResolvable, TextChannel } from "discord.js";
import { channels } from "../config";

import Guild from "../models/Guild";

export default async function (client: ExtendedClient): Promise<string[]> {
    const output: string[] = [];
    const promises = [];

    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async (resolve: any) => {
            // Check if the bot has the MANAGE_WEBHOOKS permission
            const requiredPerms: PermissionResolvable = ["ManageWebhooks"];

            if(!guild.members.me.permissions.has(requiredPerms)) return resolve();

            // Delete all webhooks made by the bot
            const webhooks = await guild.fetchWebhooks();

            for(const webhook of webhooks.values()) {
                if(webhook.owner.id === client.user.id) {
                    // Delete webhook
                    await webhook.delete();
                    // Push output to array
                    output.push(`Deleted ${webhook.name} (${webhook.id}) in ${guild.name} (${guildId})`);
                }
            }

            // Fetch Global Chat channel and create a new webhook
            const data = await Guild.findOne({ _id: guildId });

            if(!data) return resolve();

            const channel = guild.channels.cache.get(data.channel) as TextChannel;

            if(!channel) {
                await data.delete();
                resolve();
                return;
            }

            const newWebhook = await channel.createWebhook({
                name: "Global Chat",
                avatar: "https://avatars.githubusercontent.com/u/126386097"
            }).catch(() => null)

            data.webhook = newWebhook.url || null;

            if(newWebhook) {
                output.push(`Created ${newWebhook.name} (${newWebhook.id}) in ${guild.name} (${guildId})`);
            } else {
                output.push(`Failed to create a new webhook in ${guild.name} (${guildId})`);
            }

            await data.save();
            resolve();
        }))
    }

    await Promise.all(promises);

    return output;
}
