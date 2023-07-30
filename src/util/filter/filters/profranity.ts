import Filter from "../../../classes/Filter";
import { Message } from "discord.js";

import replaceContent from "../replaceContent";

import { default as FilterModel } from "../../../models/Filter";

export default async function (message: Message): Promise<Result> {
    const autobanFilter: Filter = await FilterModel.findOne({ _id: "autoban" }) || { _id: "whitelist", words: [] };
    const blacklistFilter: Filter = await FilterModel.findOne({ _id: "blacklist" }) || { _id: "blacklist", words: [] };

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
            result: true,
            matches: matches,
            filter: {
                autoban: autoban,
                blacklist: blacklist
            }
        }
    } else {
        return {
            result: false
        }
    }
}

type Result = {
    result: boolean,
    matches?: string[]
    filter?: {
        autoban: boolean,
        blacklist: boolean
    }
}
