import { Client, Collection, Snowflake } from "discord.js";
import * as Sentry from "@sentry/node";

export default class extends Client {
    public buttons: Collection<string, object>;
    public commandIds: Collection<string, Snowflake>;
    public commands: Collection<string, object>;
    public config_channels: any;
    public config_default: any;
    public config_embeds: any;
    public config_roles: any;
    public contextCommands: Collection<string, object>;
    public events: Collection<string, object>;
    public logError: any;
    public sentry: typeof Sentry;
    public validPermissions: string[];
}
