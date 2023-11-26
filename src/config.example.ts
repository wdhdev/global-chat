import { ColorResolvable, EmojiResolvable, Snowflake } from "discord.js";

const channels = {
    appeals: "",
    blocked: "",
    logs: "",
    messages: "",
    modLogs: "",
    reports: ""
}

const embeds = {
    default: "#0096FF" as ColorResolvable,
    error: "#E74C3C" as ColorResolvable,
    github: "#171515" as ColorResolvable,
    gray: "#80838D" as ColorResolvable,
    green: "#57F287" as ColorResolvable,
    red: "#ED4245" as ColorResolvable
}

const emojis = {
    connection_bad: "",
    connection_excellent: "",
    connection_good: "",
    cross: "",
    discord: "",
    github: "",
    ping: "",
    reply: "",
    tick: ""
}

const main = {
    owner: "" as Snowflake,
    primaryGuild: "" as Snowflake
}

const roles = {
    dev: "",
    donator: "",
    mod: "",
    verified: ""
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
