import Log, { Event as LogEvent } from "../classes/Log";
import Infraction, { Event as InfractionEvent } from "../classes/Infraction";
import { Role } from "../classes/Roles";
import { Snowflake } from "discord.js";

import AuditLog from "../models/AuditLog";
import { default as InfractionModel } from "../models/Infraction";

export async function createLog(user: Snowflake, id: string, event: LogEvent, role: Role, by: Snowflake) {
    let data = await AuditLog.findOne({ _id: user });

    const log: Log = {
        timestamp: Date.now(),
        event: event
    }

    if(id) log["id"] = id;
    if(role) log["role"] = role;
    if(by) log["by"] = by;

    if(!data) {
        await new AuditLog({
            _id: user,
            logs: [log]
        }).save()
    } else {
        data.logs.push(log);
        await data.save();
    }
}

export async function createInfractionLog(user: Snowflake, id: string, event: InfractionEvent, mod: Snowflake) {
    let data = await InfractionModel.findOne({ _id: user });

    const log: Infraction = {
        timestamp: Date.now(),
        event: event,
        mod: mod
    }

    if(id) log["id"] = id;

    if(!data) {
        await new InfractionModel({
            _id: user,
            audit_log: [log],
            warnings: []
        }).save()
    } else {
        data.audit_log.push(log);
        await data.save();
    }
}
