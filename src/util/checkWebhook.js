const fetch = require("node-fetch");

module.exports = async function (webhook) {
    const res = (await fetch(webhook)).ok ? true : false;

    return res;
}