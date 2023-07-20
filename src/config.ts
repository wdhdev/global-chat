const channels = {
    appeals: "1083298359319736320",
    blocked: "1078093240105975848",
    logs: "1117236422164885514",
    messages: "1084767299350822934",
    modLogs: "1082186293796147301",
    reports: "1067341548393615430"
}

const embeds = {
    default: "#E87F2A",
    error: "#E74C3C",
    github: "#171515",
    gray: "#80838D",
    green: "#57F287",
    red: "#ED4245"
}

const emojis = {
    cross: "<:cross:1127043491642478592>",
    github: "<:github:1129227804693774346>",
    ping: "<a:ping:1127044182352072786>",
    reply: "<:reply:1111102420714537012>",
    tick: "<:tick:1127043494981161081>"
}

const main = {
    hasGuildOnlyCommands: [
        "853159104956334100", // William's World
        "1067023529226293248", // Global Chat Support
        "1101152111187734649", // Batema Development
        "1114420523150102588" // Testing
    ],
    owner: "853158265466257448", // william.harrison
    ownerGuild: "1067023529226293248" // Global Chat Support
}

const presence = {
    activity: "for messages",
    activityType: 3,
    status: "ONLINE"
}

const roles = {
    booster: "1115056722042703942",
    dev: "1067023529305976898",
    donator: "1127426331286712320",
    mod: "1082167230357307402",
    verified: "1067415526491561984"
}

export {
    channels,
    embeds,
    emojis,
    main,
    presence,
    roles
}

export default {
    channels,
    embeds,
    emojis,
    main,
    presence,
    roles
}
