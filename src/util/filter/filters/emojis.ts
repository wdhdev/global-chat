import { Message } from "discord.js";

export default async function (message: Message) {
    const regex = new RegExp(/<:[a-zA-Z0-9_]+:[0-9]+>|<a:[a-zA-Z0-9_]+:[0-9]+>/g);

    const matches = message.content.match(regex) || [];

    if(matches.length > 5) {
        return {
            "result": true,
            "matches": matches
        }
    } else {
        return {
            "result": false
        }
    }
}
