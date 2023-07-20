import CustomRoles from "../../../classes/CustomRoles";
import { Message } from "discord.js";

export default async function (message: Message, role: CustomRoles) {
    const regex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

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
