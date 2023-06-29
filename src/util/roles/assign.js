module.exports = async (user, client, embed) => {
    const role = await require("./get")(user, client);

    if(role.supporter) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? `@${user.username}` : user.tag} 💖`, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` });
    if(role.verified) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? `@${user.username}` : user.tag} ✅`, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` });
    if(role.mod) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? `@${user.username}` : user.tag} 🔨`, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` });
    if(role.dev) embed.setAuthor({ name: `${user.tag.endsWith("#0") ? `@${user.username}` : user.tag} 💻`, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` });
}
