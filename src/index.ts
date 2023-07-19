require("dotenv").config();

import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: process.env.sentry_dsn,
    tracesSampleRate: 1.0,
})

import config from "./config";
import Discord, { PresenceStatusData } from "discord.js";

import CustomClient from "./classes/CustomClient";

const client = new CustomClient({
    intents: 3276799,
    presence: {
        activities: [
            {
                name: config.presence.activity,
                type: config.presence.activityType
            }
        ],
        status: config.presence.status as PresenceStatusData
    }
})

// Error Handling
process.on("unhandledRejection", (err) => Sentry.captureException(err));

// Connect to Database
import database from "./util/database";
database();

// Configs
client.config_channels = config.channels;
client.config_default = config.default;
client.config_embeds = config.embeds;
client.config_roles = config.roles;

// Handlers
client.buttons = new Discord.Collection();
client.commands = new Discord.Collection();
client.contextCommands = new Discord.Collection();
client.events = new Discord.Collection();

["button", "command", "context", "event"].forEach((handler) => {
    require(`./handlers/${handler}`)(client, Discord);
});

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
import sentryAPI from "./sentry-api/index";
sentryAPI(client);
