import { Message } from "discord.js";

export default async function (message: Message) {
    const regex = new RegExp(/^#{1,4}\s(?!.*\[#.*\]$).*/gm);

    const matches = message.content.match(regex) || [];

    if(matches.length) {
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
