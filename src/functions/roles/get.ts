import ExtendedClient from "../../classes/ExtendedClient";
import { Snowflake } from "discord.js";

import Roles from "../../classes/Roles";

import User from "../../models/User";

export default async function (userId: Snowflake, client: ExtendedClient) {
    const data = await User.findOne({ _id: userId });

    const roles: Roles = {
        owner: client.config_main.owner === userId,
        dev: data?.dev ? true : false,
        mod: data?.mod ? true : false,
        donator: data?.donator ? true : false,
        verified: data?.verified ? true : false,
        immunity: data?.immune ? true : false
    }

    return roles;
}
