export default function (content: string): string {
    const insensitive = require("../../../eggs/insensitive.json");
    const sensitive = require("../../../eggs/sensitive.json");

    for(const [key, value] of Object.entries(insensitive)) {
        if(content.toLowerCase() === key) return value as string;
    }

    for(const [key, value] of Object.entries(sensitive)) {
        if(content === key) return value as string;
    }

    return content;
}
