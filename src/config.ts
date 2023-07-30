import { ColorResolvable, EmojiResolvable, Snowflake } from "discord.js";

const channels: { [key: string]: Snowflake } = {
    appeals: "1083298359319736320",
    blocked: "1078093240105975848",
    logs: "1117236422164885514",
    messages: "1084767299350822934",
    modLogs: "1082186293796147301",
    reports: "1067341548393615430"
}

const embeds: { [key: string]: ColorResolvable } = {
    default: "#0096FF",
    error: "#E74C3C",
    github: "#171515",
    gray: "#80838D",
    green: "#57F287",
    red: "#ED4245"
}

const emojis: { [key: string]: EmojiResolvable } = {
    connection_bad: "<:connection_bad:1134804962732429332>",
    connection_excellent: "<:connection_excellent:1134809429783617557>",
    connection_good: "<:connection_good:1134804958793977928>",
    cross: "<:cross:1127043491642478592>",
    discord: "<:discord:1134618172625006742>",
    github: "<:github:1129227804693774346>",
    ping: "<a:ping:1127044182352072786>",
    reply: "<:reply:1111102420714537012>",
    tick: "<:tick:1127043494981161081>"
}

const main = {
    owner: "853158265466257448" as Snowflake, // williamharrison
    primaryGuild: "1067023529226293248" as Snowflake // Global Chat Support
}

const roles: { [key: string]: Snowflake } = {
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
    roles
}

export default {
    channels,
    embeds,
    emojis,
    main,
    roles
}
