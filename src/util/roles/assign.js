module.exports = async (message, client, chat) => {
    const role = await require("./get")(message.author, client);

    const username = message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag;
    const avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
    const url = `https://discord.com/users/${message.author.id}`;

    if(role.supporter) chat.setAuthor({ name: `${username} 💖`, iconURL: avatar, url: url });
    if(role.verified) chat.setAuthor({ name: `${username} ✅`, iconURL: avatar, url: url });
    if(role.mod) chat.setAuthor({ name: `${username} 🔨`, iconURL: avatar, url: url });
    if(role.dev) chat.setAuthor({ name: `${username} 💻`, iconURL: avatar, url: url });
}
