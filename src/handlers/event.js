module.exports = (client, Discord) => {
    const loadEvents = require("../helpers/loadEvents");

    loadEvents(client, Discord);

    const Sentry = require("@sentry/node");

    client.logEventError = async function(err) {
        Sentry.captureException(err);
    }

    require("dotenv").config();
}