module.exports = (client, Discord) => {
    const loadEvents = require("../helpers/loadEvents");

    loadEvents(client, Discord);

    client.logEventError = async function(err) {
        client.sentry.captureException(err);
    }

    require("dotenv").config();
}