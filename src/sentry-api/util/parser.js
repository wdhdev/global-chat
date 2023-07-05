// https://github.com/IanMitchell/sentrydiscord.dev/blob/867b889e15c6b101d619610d07b4663c6a73fe6a/lib/message.ts

module.exports.getColor = function (level) {
    switch (level) {
        case "debug":
            return parseInt("fbe14f", 16);
        case "info":
            return parseInt("2788ce", 16);
        case "warning":
            return parseInt("f18500", 16);
        case "fatal":
            return parseInt("d20f2a", 16);
        case "error":
        default:
            return parseInt("e03e2f", 16);
    }
}

module.exports.getContexts = function (issue) {
    const contexts = this.getEvent(issue)?.contexts ?? {};

    const values = Object.values(contexts)
        .map((value) => `${value?.name} ${value?.version}`)
        .filter((value) => value !== "undefined undefined");

    return values ?? [];
}

module.exports.getErrorCodeSnippet = function (issue) {
    const stacktrace = this.getStacktrace(issue);
    const location = stacktrace?.frames?.reverse()?.[0];

    if(!location) return this.getEvent(issue)?.culprit ?? null;

    return ` ${location.pre_context?.join("\n ") ?? ""}\n>${
        location.context_line
    }\n${location.post_context?.join("\n") ?? ""}`;
}

module.exports.getErrorLocation = function (issue, maxLines = Infinity) {
    const stacktrace = this.getStacktrace(issue);
    const locations = stacktrace?.frames;

    let files = locations?.map(
        (location) =>
            `${location?.filename}, ${location?.lineno ?? "?"}:${
                location?.colno ?? "?"
            }`
    );

    if(maxLines < Infinity && files?.length > maxLines) {
        files = files.slice(0, maxLines);
        files.push("...");
    }

    return files;
}

module.exports.getEvent = function (issue) {
    return issue?.event ?? issue?.data?.issue ?? issue;
}

module.exports.getExtras = function (issue) {
    const extras = this.getEvent(issue)?.extra ?? {};

    const values = Object.entries(extras).map(
        ([key, value]) => `**${key}**: ${value}`
    );

    return values ?? [];
}

module.exports.getFileLocation = function (issue) {
    return this.getEvent(issue)?.location;
}

module.exports.getLanguage = function (issue) {
    return this.getEvent(issue)?.location?.split(".")?.slice(-1)?.[0] || "";
}

module.exports.getLevel = function (issue) {
    return this.getEvent(issue)?.level;
}

module.exports.getLink = function (issue) {
    return issue?.url ?? "https://sentry.io";
}

module.exports.getMessage = function (issue) {
    return issue?.message;
}

module.exports.getOrganisation = function (url) {
    const regex = /https:\/\/([\w-]+)\.sentry\.io/;
    const match = url.match(regex);

    return match[1] ?? null;
}

module.exports.getPlatform = function (issue) {
    return this.getEvent(issue)?.platform;
}

module.exports.getProject = function (issue) {
    return issue?.project?.project_name ?? this.getEvent(issue)?.project?.name;
}

module.exports.getProjectLink = function (issue) {
    return `https://${this.getOrganisation(this.getLink(issue))}.sentry.io/projects/${issue.project_slug}`;
}

module.exports.getRelease = function (issue) {
    return this.getEvent(issue)?.release;
}

module.exports.getStacktrace = function (issue) {
    return (
        this.getEvent(issue)?.stacktrace ??
        this.getEvent(issue)?.exception?.values[0]?.stacktrace
    );
}

module.exports.getTags = function (issue) {
    return this.getEvent(issue)?.tags ?? [];
}

module.exports.getTime = function (issue) {
    const event = this.getEvent(issue);

    if(event?.timestamp) return new Date(event?.timestamp * 1000);
    if(event?.lastSeen != null) return new Date(event?.lastSeen);

    if(event?.firstSeen != null) return new Date(event?.firstSeen);

    return new Date();
}

module.exports.getTitle = function (issue) {
    return this.getEvent(issue)?.title ?? "Sentry Event";
}

module.exports.getType = function (issue) {
    return this.getEvent(issue)?.type;
}

module.exports.getUser = function (issue) {
    return this.getEvent(issue)?.user;
}
