module.exports = (client, Discord) => {
    const load = require("../helpers/loadEvents");

    load(client, Discord);

    client.logEventError = async function(err) {
        client.sentry.captureException(err);
    }

    require("dotenv").config();
}