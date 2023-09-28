import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { Message, PermissionResolvable } from "discord.js";

import getRoles from "../../functions/roles/get";
import send from "../../util/send";

import BannedUser from "../../models/BannedUser";
import Guild from "../../models/Guild";

const eventTriggers = new Map();

const event: Event = {
    name: "messageCreate",
    once: false,
    async execute(client: ExtendedClient & any, Discord: typeof import("discord.js"), message: Message) {
        try {
            if(client.killSwitch) return;

            const requiredPerms: PermissionResolvable = ["SendMessages", "EmbedLinks", "ManageMessages"];

            if(message.author.bot || !message.guild) return;
            if(!message.guild.members.me.permissions.has(requiredPerms)) return;

            const role = await getRoles(message.author.id, client);

            if(await Guild.exists({ _id: message.guild.id, channel: message.channel.id })) {
                // Check if the user has triggered the event more than 5 times in 3 seconds
                const currentTime = Date.now();
                const userTriggers = eventTriggers.get(message.author.id) || { count: 0, timestamp: 0 };

                if(currentTime - userTriggers.timestamp < 3000) {
                    userTriggers.count++;
                } else {
                    // Reset the event count if more than 3 seconds have passed
                    userTriggers.count = 1;
                    userTriggers.timestamp = currentTime;
                }

                eventTriggers.set(message.author.id, userTriggers);

                if(userTriggers.count > 5 && !role.staff) {
                    const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

                    await new BannedUser({
                        _id: message.author.id,
                        timestamp: Date.now(),
                        allowAppeal: true,
                        reason: "[AUTOMOD] Raid detected, more than 5 messages sent in 3 seconds.",
                        mod: client.user.id
                    }).save()

                    // Remove the user from the map after taking action
                    eventTriggers.delete(message.author.id);

                    const ban = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setTitle("🔨 Ban")
                        .addFields (
                            { name: "❓ Reason", value: "[AUTOMOD] Raid detected, more than 5 messages sent in 3 seconds." },
                            { name: "📜 Appealable", value: "✅" },
                            { name: "ℹ️ How to Appeal", value: "1. Join the [support server](https://discord.gg/9XW6ru8d9D).\n2. Go to the [appeal channel](https://discord.com/channels/1067023529226293248/1094505532267704331).\n3. Click \`Submit\` and fill in the form.\n4. Wait for a response to your appeal." }
                        )
                        .setTimestamp()

                    let sentDM = false;

                    try {
                        await message.author.send({ embeds: [ban] });
                        sentDM = true;
                    } catch {}

                    const banLog = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${client.user.id}` })
                        .setTitle("User Banned")
                        .addFields (
                            { name: "👤 User", value: `${message.author}` },
                            { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                            { name: "❓ Reason", value: "[AUTOMOD] Raid detected, more than 5 messages sent in 3 seconds." },
                            { name: "📜 Appealable", value: "✅" }
                        )
                        .setTimestamp()

                    modLogsChannel.send({ embeds: [banLog] });
                    return;
                }

                await send(message, client, Discord);
            }
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
