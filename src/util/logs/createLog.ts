import Log, { Event } from "../../classes/Log";
import { Role } from "../../classes/Roles";
import { Snowflake } from "discord.js";

import AuditLog from "../../models/AuditLog";

export default async function (user: Snowflake, id: string, event: Event, role: Role, by: Snowflake) {
    let data = await AuditLog.findOne({ _id: user });

    const log: Log = {
        timestamp: Date.now(),
        event: event
    }

    if(id) log["id"] = id;
    if(role) log["role"] = role;
    if(by) log["by"] = by;

    if(!data) {
        new AuditLog({
            _id: user,
            logs: [log]
        }).save()
    } else {
        data.logs.push(log);
        await data.save();
    }
}
