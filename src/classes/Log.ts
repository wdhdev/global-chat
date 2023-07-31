import { Snowflake } from "discord.js";

import AuditLog from "../models/AuditLog";
import { Role, getRoleWithEmoji } from "./Roles";

export default class Log {
    public id?: String;
    public timestamp: number;
    public event: Event;
    public nickname?: String;
    public role?: Role;
    public by?: Snowflake;
}

export async function getLogs(user: Snowflake, max: number, short: boolean): Promise<string[]> {
    const data = await AuditLog.findOne({ _id: user });
    const logs: string[] = [];

    let i = 0;

    list:
    if(data) {
        const formattedData = data.logs.sort((a: Log, b: Log) => b.timestamp - a.timestamp);

        for(const log of formattedData) {
            if(i >= max && max !== -1) {
                if(formattedData.length !== i) {
                    const leftover = formattedData.length - i;
                    logs.push(`*${leftover} more item${leftover === 1 ? "": "s"}...*`);
                }

                break list;
            }

            if(log.event === "appealApprove") logs.push(`✅ Appeal approved \`${log.id}\`${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "appealCreate") logs.push(`📄 Appeal created \`${log.id}\`${!short ? ` @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "appealDelete") logs.push(`🗑️ Appeal deleted \`${log.id}\`${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "appealDeny") logs.push(`❌ Appeal denied \`${log.id}\`${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "immunityAdd") logs.push(`😇 Immunity added${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "immunityRemove") logs.push(`😇 Immunity removed${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "messageDelete") logs.push(`🗑️ Deleted message \`${log.id}\`${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "messageReport") logs.push(`❗ Reported message \`${log.id}\`${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "nicknameAdd") logs.push(`➕ Nickname set to \`${log.nickname}\`${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "nicknameRemove") logs.push(`➖ Nickname removed${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "roleAdd") logs.push(`${getRoleWithEmoji(log.role)} role added${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);
            if(log.event === "roleRemove") logs.push(`${getRoleWithEmoji(log.role)} role removed${!short ? ` by <@${log.by}> @ <t:${log.timestamp.toString().slice(0, -3)}>` : ""}`);

            i++;
        }
    }

    return logs;
}

export type Event =  "appealApprove" | "appealCreate" | "appealDelete" | "appealDeny" | "immunityAdd" | "immunityRemove" | "messageDelete" | "messageReport" | "nicknameAdd" | "nicknameRemove" | "roleAdd" | "roleRemove";
