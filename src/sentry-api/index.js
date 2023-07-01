module.exports = async (client) => {
    const express = require("express");
    const app = express();

    require("dotenv").config();

    const Sentry = require("@sentry/node");
    const bodyParser = require("body-parser");
    const cors = require("cors");

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

    const routes = require("./util/routes");
    
    app.get("/info/:secret", async (req, res) => {
        routes.info(req, res);
    })
    
    app.post("/:secret", async (req, res) => {
        routes.index(req, res, client);
    })

    app.use(Sentry.Handlers.errorHandler());

    app.listen(port, () => {
        console.log(`[SENTRY API] Listening on Port: ${port}`);
    })
}
