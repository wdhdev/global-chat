import ExtendedClient from "../../classes/ExtendedClient";
import { EmbedBuilder, User } from "discord.js";

import getRoles from "./get";

export default async (user: User, client: ExtendedClient, embed: EmbedBuilder) => {
    const role = await getRoles(user.id, client);

    if(role.verified) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} ✅`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
    if(role.donator) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} 💸`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
    if(role.mod) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} 🔨`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
    if(role.dev) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} 💻`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
}
