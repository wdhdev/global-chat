import { Snowflake } from "discord.js";

import { default as InfractionModel } from "../models/Infraction";

export default class Infraction {
    public id?: String;
    public timestamp: number;
    public event: Event;
    public mod: Snowflake;
}

export async function getInfractions(user: Snowflake, max: number, short: boolean): Promise<string[]> {
    const data = await InfractionModel.findOne({ _id: user })
    const infractions: string[] = [];

    let i = 0;

    list:
    if(data) {
        const formattedData = data.audit_log.sort((a: Infraction, b: Infraction) => b.timestamp - a.timestamp);

        for(const infraction of formattedData) {
            if(i >= max && max !== -1) {
                if(formattedData.length !== i) {
                    const leftover = formattedData.length - i;
                    infractions.push(`*${leftover} more item${leftover === 1 ? "": "s"}...*`);
                }

                break list;
            }

            if(infraction.event === "ban") infractions.push(`🔨 Banned${!short ? ` by <@${infraction.mod}> @ <t:${infraction.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(infraction.event === "unban") infractions.push(`🙌 Unbanned${!short ? ` by <@${infraction.mod}> @ <t:${infraction.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(infraction.event === "warn") infractions.push(`⚠️ Warning \`${infraction.id}\`${!short ? ` by <@${infraction.mod}> @ <t:${infraction.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(infraction.event === "warnDelete") infractions.push(`🗑️ Warning \`${infraction.id}\` deleted${!short ? ` by <@${infraction.mod}> @ <t:${infraction.timestamp.toString().slice(0, -3)}>` : ""}`);
            i++;
        }
    }

    return infractions;
}

export type Event = "ban" | "unban" | "warn" | "warnDelete";
