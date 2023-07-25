import { Snowflake } from "discord.js";

import Infraction from "../models/Infraction";

export default class {
    public id: String;
    public timestamp: number;
    public mod: Snowflake;
    public reason: String;
}

export async function getWarnings(user: Snowflake): Promise<string[]> {
    const data = await Infraction.findOne({ _id: user });
    const warnings: string[] = [];

    if(data) {
        const formattedData = data.warnings.sort((a, b) => b.timestamp - a.timestamp);

        for(const warning of formattedData) {
            warnings.push(`\`${warning.id}\` **|** <@${warning.mod}> **|** <t:${warning.timestamp.toString().slice(0, -3)}:R>\n❓ ${warning.reason}`);
        }
    }

    return warnings;
}
