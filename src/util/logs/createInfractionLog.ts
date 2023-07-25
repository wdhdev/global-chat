import { default as InfractionType, Event } from "../../classes/Infraction";
import { Snowflake } from "discord.js";

import Infraction from "../../models/Infraction";

export default async function (user: Snowflake, id: string, event: Event, mod: Snowflake) {
    let data = await Infraction.findOne({ _id: user });

    const log: InfractionType = {
        timestamp: Date.now(),
        event: event,
        mod: mod
    }

    if(id) log["id"] = id;

    if(!data) {
        new Infraction({
            _id: user,
            audit_log: [log],
            warnings: []
        }).save()
    } else {
        data.audit_log.push(log);
        await data.save();
    }
}
