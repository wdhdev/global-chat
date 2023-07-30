import { Snowflake } from "discord.js";

import { createInfractionLog } from "../util/logger";
import { randomUUID } from "crypto";

import Infraction from "../models/Infraction";

export default async function (user: Snowflake, reason: string, mod: Snowflake): Promise<string> {
    let data = await Infraction.findOne({ _id: user });

    const id = randomUUID().slice(0, 8);

    if(!data) {
        new Infraction({
            _id: user,
            audit_log: [],
            warnings: [
                {
                    id: id,
                    timestamp: Date.now(),
                    mod: mod,
                    reason: reason
                }
            ]
        }).save()
    } else {
        data.warnings.push({
            id: id,
            timestamp: Date.now(),
            mod: mod,
            reason: reason
        })

        await data.save();
    }

    await createInfractionLog(user, id, "warn", mod);

    return id;
}
