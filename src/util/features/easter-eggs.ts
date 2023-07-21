import * as Sentry from "@sentry/node";
import fetch from "node-fetch";

export default async function (content: String) {
    try {
        const insensitive = await fetch("https://raw.githubusercontent.com/Global-Chat-Bot/easter-eggs/main/eggs/insensitive.json").then(res => res.json());
        const sensitive = await fetch("https://raw.githubusercontent.com/Global-Chat-Bot/easter-eggs/main/eggs/sensitive.json").then(res => res.json());

        for(const [key, value] of Object.entries(insensitive)) {
            if(content.toLowerCase() === key) return value;
        }

        for(const [key, value] of Object.entries(sensitive)) {
            if(content === key) return value;
        }

        return content;
    } catch(err) {
        Sentry.captureException(err);
        console.error(err);

        return content;
    }
}
