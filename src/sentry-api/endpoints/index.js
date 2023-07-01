const cap = require("../../util/cap");
const parser = require("../../util/sentry/parser");

const schema = require("../../models/sentrySchema");

module.exports = async (req, res, client, Discord) => {
    if(!await schema.exists({ _id: req.params.secret })) return res.status(401).json({ "message": "Invalid capture ID.", "code": "INVALID_ID" });

    const data = await schema.findOne({ _id: req.params.secret });

    if(!req.body.project.id === data.project) return res.status(401).json({ "message": "Different project ID specified.", "code": "DIFFERENT_PROJECT" });

    const event = req.body;

    const embed = new Discord.EmbedBuilder()
        .setColor(client.config_embeds.error)
        .setAuthor({ name: `${req.body.project.name}` })

    const projectName = parser.getProject(event);

    const eventTitle = parser.getTitle(event);

    if(projectName) {
        const embedTitle = `[${projectName}] ${eventTitle}`;
        embed.setTitle(cap(embedTitle, 250));
    } else {
        embed.setTitle(cap(eventTitle, 250));
    }

    const link = parser.getLink(event);

    if(link.startsWith("https://") || link.startsWith("http://")) {
        embed.setURL(parser.getLink(event));
    }

    embed.setTimestamp(parser.getTime(event));
    embed.setColor(getColor(parser.getLevel(event)));

    const fileLocation = parser.getFileLocation(event);
    const snippet = cap(parser.getErrorCodeSnippet(event), 3900);

    if(snippet) {
        embed.setDescription(
            `${
                fileLocation ? `\`📄 ${fileLocation.slice(-95)}\`\n` : ""
            }\`\`\`${
                parser.getLanguage(event) ?? parser.getPlatform(event)
            }\n${snippet}
        \`\`\``
        );
    } else {
        embed.setDescription("Unable to generate code snippet.");
    }

    const fields = [];

    const location = parser.getErrorLocation(event, 7);

    if(location?.length > 0) {
        fields.push({
            name: "Stack",
            value: `\`\`\`${cap(location.join("\n"), 1000)}\n\`\`\``,
        });
    }

    const user = parser.getUser(event);

    if(user?.username) {
        fields.push({
            name: "User",
            value: cap(
                `${user.username} ${user.id ? `(${user.id})` : ""}`,
                1024
            ),
            inline: true,
        });
    }

    const tags = parser.getTags(event);

    if(Object.keys(tags).length > 0) {
        fields.push({
            name: "Tags",
            value: cap(
                tags.map(([key, value]) => `${key}: ${value}`).join("\n"),
                1024
            ),
            inline: true,
        });
    }

    const extras = parser.getExtras(event);

    if(extras.length > 0) {
        fields.push({
            name: "Extras",
            value: cap(extras.join("\n"), 1024),
            inline: true,
        });
    }

    const contexts = parser.getContexts(event);

    if(contexts.length > 0) {
        fields.push({
            name: "Contexts",
            value: cap(contexts.join("\n"), 1024),
            inline: true,
        });
    }

    const release = parser.getRelease(event);

    if(release) {
        fields.push({
            name: "Release",
            value: cap(release, 1024),
            inline: true,
        });
    }

    embed.addFields(fields);

    const actions = new Discord.ActionRowBuilder()
        .addComponents (
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`sentry-resolve-${event.project.id}`)
                .setEmoji("✅")
                .setLabel("Resolve")
        )

    const channel = client.channels.cache.get(data.channel);

    channel.send({ embeds: [embed], components: [actions] });

    res.status(200);
}
