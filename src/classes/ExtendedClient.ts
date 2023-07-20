import { Client, Collection, Snowflake } from "discord.js";
import * as Sentry from "@sentry/node";

export default class extends Client {
    public buttons: Collection<string, any>;
    public commandIds: Collection<string, Snowflake>;
    public commands: Collection<string, any>;
    public config_channels: any;
    public config_embeds: any;
    public config_main: any;
    public config_roles: any;
    public contextCommands: Collection<string, any>;
    public events: Collection<string, any>;
    public logButtonError: Function;
    public logCommandError: Function;
    public logContextError: Function;
    public logError: Function;
    public sentry: typeof Sentry;
    public validPermissions: string[];
}
