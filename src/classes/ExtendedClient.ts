import { Client, Collection, Snowflake } from "discord.js";
import * as Sentry from "@sentry/node";

import config from "../config";

export default class extends Client {
    public buttons: Collection<string, any>;
    public commandIds: Collection<string, Snowflake>;
    public commands: Collection<string, any>;
    public config_channels: typeof config.channels;
    public config_embeds: typeof config.embeds;
    public config_main: typeof config.main;
    public config_roles: typeof config.roles;
    public contextCommands: Collection<string, any>;
    public events: Collection<string, any>;
    public logButtonError: Function;
    public logCommandError: Function;
    public logContextError: Function;
    public logError: Function;
    public sentry: typeof Sentry;
    public validPermissions: string[];
}
