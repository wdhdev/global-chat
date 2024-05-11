import ExtendedClient from "../classes/ExtendedClient";

import { PermissionResolvable } from "discord.js";

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

            resolve();
        }))
    }

    await Promise.all(promises);

    return output;
}
