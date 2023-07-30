import { Snowflake } from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            clientId: Snowflake;
            database: string;
            sentry_api_port: number;
            sentry_bearer: string;
            sentry_dsn: string;
            sentry_org: string;
            sentry_project: string;
            token: string;
        }
    }
}

export {};
