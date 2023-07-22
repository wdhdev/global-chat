import Roles from "../../../classes/Roles";
import { Message } from "discord.js";

export default async function (message: Message, role: Roles) {
    const regex = new RegExp(/(?:https?:\/\/)[a-z0-9_\-\.]*[a-z0-9_\-]{2,}\.[a-z]{2,}/g);

    const matches = message.content.match(regex) || [];

    if(matches.length && !role.verified) {
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
