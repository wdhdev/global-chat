const fetch = require("node-fetch");

require("dotenv").config();

async function sendRequest() {
    console.log(
        await fetch("https://discord.com/api/v9/users/@me", {
            method: "GET",
            headers: { Authorization: `Bot ${process.env.token}` },
        }).then((res) => res.json())
    );
}

sendRequest();
