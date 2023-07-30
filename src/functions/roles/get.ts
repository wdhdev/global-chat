import ExtendedClient from "../../classes/ExtendedClient";
import { Snowflake } from "discord.js";

import Roles from "../../classes/Roles";

import User from "../../models/User";

export default async function (userId: Snowflake, client: ExtendedClient): Promise<Roles> {
    const data = await User.findOne({ _id: userId });

    return {
        owner: client.config_main.owner === userId,
        dev: data?.dev ? true : false,
        mod: data?.mod ? true : false,
        donator: data?.donator ? true : false,
        verified: data?.verified ? true : false,
        immunity: data?.immune ? true : false
    }
}
