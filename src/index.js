const Sentry = require("@sentry/node");

require("dotenv").config();

Sentry.init({
    dsn: process.env.sentry_dsn,
    tracesSampleRate: 1.0
})

const config = require("./config.json");

const Discord = require("discord.js");
const client = new Discord.Client({
    intents: 3276799,
    presence: {
        activities: [
            {
                name: config.presence.activity,
                type: config.presence.activityType,
            }
        ],
        status: config.presence.status
    }
})

// Error Handling
client.on("error", (err) => Sentry.captureException(err));
client.on("warn", (warn) => Sentry.captureMessage(warn));
process.on("unhandledRejection", (err) => Sentry.captureException(err));

// Connect to Database
const database = require("./util/database/connect");
database();

// Configs
client.config_channels = config.channels;
client.config_default = config.default;
client.config_embeds = config.embeds;
client.config_emojis = config.emojis;
client.config_presence = config.presence;
client.config_roles = config.roles;

// Handlers
client.buttons = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

["button", "command", "event"].forEach(handler => {
    require(`./handlers/${handler}`) (client, Discord);
})

// Login
client.login(process.env.token);

// Constants
client.commandIds = new Discord.Collection();
client.sentry = Sentry;

client.validPermissions = [
    "CreateInstantInvite",
    "KickMembers",
    "BanMembers",
    "Administrator",
    "ManageChannels",
    "ManageGuild",
    "AddReactions",
    "ViewAuditLog",
    "PrioritySpeaker",
    "Stream",
    "ViewChannel",
    "SendMessages",
    "SendTTSMessages",
    "ManageMessages",
    "EmbedLinks",
    "AttachFiles",
    "ReadMessageHistory",
    "MentionEveryone",
    "UseExternalEmojis",
    "ViewGuildInsights",
    "Connect",
    "Speak",
    "MuteMembers",
    "DeafenMembers",
    "MoveMembers",
    "UseVAD",
    "ChangeNickname",
    "ManageNicknames",
    "ManageRoles",
    "ManageWebhooks",
    "ManageEmojisAndStickers",
    "UseApplicationCommands",
    "RequestToSpeak",
    "ManageEvents",
    "ManageThreads",
    "CreatePublicThreads",
    "CreatePrivateThreads",
    "UseExternalStickers",
    "SendMessagesInThreads",
    "UseEmbeddedActivities",
    "ModerateMembers",
    "ViewCreatorMonetizationAnalytics",
    "UseSoundboard",
    "SendVoiceMessages"
]

// Start Sentry API
const sentryAPI = require("./sentry-api/index");
sentryAPI();

module.exports = client;
