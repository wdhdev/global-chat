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

    const port = process.env.auth_api_port;

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    app.use(cors({ origin: "*" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());

    app.engine("html", require("ejs").renderFile);
    app.set("view engine", "ejs");
    app.set("views", "auth-api/views");

    const routes = require("./routes");

    app.get("/github", async (req, res) => {
        routes.github.index(req, res, client);
    })

    app.get("/github/callback", async (req, res) => {
        routes.github.callback(req, res, client);
    })

    app.use(Sentry.Handlers.errorHandler());

    app.listen(port, () => {
        console.log(`[AUTH API] Listening on Port: ${port}`);
    })
}
