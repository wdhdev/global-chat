const fetch = require("node-fetch");

module.exports = async function (webhook) {
    if((await fetch(webhook)).ok) {
        return true;
    } else {
        return false;
    }
}