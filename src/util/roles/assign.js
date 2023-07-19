module.exports = async (user, client, embed) => {
    const role = await require("./get")(user.id, client);

    if(role.supporter) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} 💖`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
    if(role.verified) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} ✅`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
    if(role.donator) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} 💸`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
    if(role.mod) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} 🔨`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
    if(role.dev) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? user.username : user.tag} 💻`, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });
}
