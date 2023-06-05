module.exports = async (message, client, chat) => {
	const role = await require("./getRoles")(message, client);

	if(role.supporter) chat.setFooter({ text: "💖 Supporter" });
	if(role.verified) chat.setAuthor({ name: `${message.author.tag} ✅`, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
	if(role.mod) chat.setFooter({ text: "🔨 Moderator" });
    if(role.dev) chat.setFooter({ text: "💻 Developer" });
}