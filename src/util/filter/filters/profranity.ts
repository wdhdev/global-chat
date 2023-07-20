import { Message } from "discord.js";

import replaceContent from "../replaceContent";

import Filter from "../../../models/Filter";

export default async function (message: Message) {
    const autobanFilter: any = await Filter.findOne({ _id: "autoban" }) || { words: [] };
    const blacklistFilter: any = await Filter.findOne({ _id: "blacklist" }) || { words: [] };

    const content = replaceContent(message.content.toLowerCase());

    const matches: string[] = [];

    let autoban = false;
    let blacklist = false;

    autobanFilter.words.some((word: string) => {
        if(content.includes(word)) {
            matches.push(word);
            autoban = true;
        }
    })

    blacklistFilter.words.some((word: string) => {
        if(content.includes(word)) {
            matches.push(word);
            blacklist = true;
        }
    })

    if(matches.length) {
        return {
            "result": true,
            "matches": matches,
            "filter": {
                "autoban": autoban,
                "blacklist": blacklist
            }
        }
    } else {
        return {
            "result": false
        }
    }
}
