import Roles from "../../../classes/Roles";
import { Message } from "discord.js";

import getDomain from "../../getDomain";

import WhitelistedDomain from "../../../models/WhitelistedDomain";

export default async function (message: Message, role: Roles) {
    const regex = new RegExp(/(?:https?:\/\/)[a-z0-9_\-\.]*[a-z0-9_\-]{2,}\.[a-z]{2,}/g);

    const regexMatches = message.content.match(regex) || [];
    const remove: string[] = [];

    const data = await WhitelistedDomain.find();

    for(const document of data) {
        remove.push(document._id);
    }

    const matches = regexMatches.filter(domain => !remove.includes(getDomain(domain)));

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
