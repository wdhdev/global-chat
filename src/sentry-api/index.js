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

    // Host public files
    app.use(express.static(__dirname + "/public"));

    const routes = require("./routes");

    app.delete("/:secret", async (req, res) => {
        routes.delete(req, res);
    })

    app.get("/:secret", async (req, res) => {
        routes.get(req, res);
    })

    app.post("/:secret", async (req, res) => {
        routes.post(req, res, client);
    })

    app.use(Sentry.Handlers.errorHandler());

    app.listen(port, () => {
        console.log(`[SENTRY API] Listening on Port: ${port}`);
    })
}
