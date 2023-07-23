import ExtendedClient from "../../classes/ExtendedClient";
import { Snowflake } from "discord.js";

import Roles from "../../classes/Roles";

import User from "../../models/User";

export default async function (userId: Snowflake, client: ExtendedClient) {
    let supporter = false;

    try {
        const guild = await client.guilds.fetch(client.config_main.primaryGuild);
        const member = await guild.members.fetch(userId);

        supporter = member.premiumSinceTimestamp ? true : false;
    } catch {}

    const data = await User.findOne({ _id: userId });

    const roles: Roles = {
        owner: client.config_main.owner === userId,
        dev: data?.dev ? data.dev : false,
        mod: data?.mod ? data.mod : false,
        verified: data?.verified ? data.verified : false,
        donator: data?.donator ? data.donator : false,
        supporter: supporter,
        immunity: data?.immune ? data.immune : false
    }

    return roles;
}
