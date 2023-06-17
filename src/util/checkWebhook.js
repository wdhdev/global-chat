const fetch = require("axios");

module.exports = async function (webhook) {
    if((await fetch(webhook)).ok) {
        return true;
    } else {
        return false;
    }
}