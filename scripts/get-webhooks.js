const Discord = require("discord.js");
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildWebhooks
    ]
})

const fs = require("fs");

require("dotenv").config();

client.on("ready", async () => {
    console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? client.user.username : client.user.tag}`);

    const guildWebhooks = {};

    const promises = [];

    client.guilds.cache.forEach(async guild => {
        promises.push(new Promise(async resolve => {
            guild.fetchWebhooks().then(async webhooks => {
                const botWebhooks = webhooks.filter(webhook => webhook.owner.id === client.user.id);

                const webhookList = botWebhooks.map(webhook => ({
                    url: webhook.url,
                    id: webhook.id,
                    channel: {
                        name: webhook.channel.name,
                        id: webhook.channelId
                    },
                    guild: {
                        name: guild.name,
                        id: guild.id
                    }
                }))

                guildWebhooks[guild.id] = webhookList;

                if(guildWebhooks[guild.id].length) {
                    saveWebhooksToFile(guildWebhooks, guild.id, resolve);
                } else {
                    resolve();
                }
            }).catch(err => resolve(console.log(`Failed to fetch data from ${guild.id}!\nERROR: ${err.message}`)))
        }))
    })

    Promise.all(promises).then(async () => {
        process.exit();
    })
})

async function saveWebhooksToFile(webhooks, guild, resolve) {
    const json = JSON.stringify(webhooks, null, 4);

    fs.writeFile("webhooks.json", json, (err) => {
        if(err) {
            console.error("Error saving webhooks to file:", err);
            resolve();
        }

        console.log(`Saved data from ${guild} to webhooks.json!`);
        resolve(json);
    })
}

client.login(process.env.token);
