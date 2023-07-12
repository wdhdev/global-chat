const fetch = require("node-fetch");

module.exports = async function (webhook) {
    return (await fetch(webhook)).ok || true;
}
