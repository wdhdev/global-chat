import { Client } from "discord.js";

import * as Sentry from "@sentry/node";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import routes from "./routes";

export default async (client: Client & any) => {
    const app = express();

    require("dotenv").config();

    Sentry.init({
        dsn: process.env.sentry_dsn,
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Express({ app }),
            ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
        ],
        tracesSampleRate: 1.0
    })

    const port = process.env.sentry_api_port;

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    app.use(cors({ origin: "*" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());

    // Host public files
    app.use(express.static(__dirname + "/public"));

    app.post("/:secret", async (req: Request, res: Response) => {
        routes.index(req, res, client);
    })

    app.use(Sentry.Handlers.errorHandler());

    app.listen(port, () => {
        console.log(`[SENTRY API] Listening on Port: ${port}`);
    })
}
