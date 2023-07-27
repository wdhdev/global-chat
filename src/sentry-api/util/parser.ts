type SentryIssue = Record<string, any>;

export function getColor(level: string) {
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

export function getContexts(issue: SentryIssue) {
    const contexts = this.getEvent(issue)?.contexts ?? {};

    const values = Object.values(contexts)
        .map((value: any) => `${value?.name} ${value?.version}`)
        .filter((value: any) => value !== "undefined undefined");

    return values ?? [];
}

export function getErrorCodeSnippet(issue: SentryIssue) {
    const stacktrace = this.getStacktrace(issue);
    const location = stacktrace?.frames?.reverse()?.[0];

    if(!location) return this.getEvent(issue)?.culprit ?? null;

    return ` ${location.pre_context?.join("\n ") ?? ""}\n>${
        location.context_line
    }\n${location.post_context?.join("\n") ?? ""}`;
}

export function getErrorLocation(issue: SentryIssue, maxLines = Infinity) {
    const stacktrace = this.getStacktrace(issue);
    const locations = stacktrace?.frames;

    let files = locations?.map(
        (location: any) =>
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

export function getEvent(issue: SentryIssue) {
    return issue?.event ?? issue?.data?.issue ?? issue;
}

export function getExtras(issue: SentryIssue) {
    const extras = this.getEvent(issue)?.extra ?? {};

    const values = Object.entries(extras).map(
        ([key, value]) => `**${key}**: ${value}`
    );

    return values ?? [];
}

export function getFileLocation(issue: SentryIssue) {
    return this.getEvent(issue)?.location;
}

export function getLanguage(issue: SentryIssue) {
    return this.getEvent(issue)?.location?.split(".")?.slice(-1)?.[0] || "";
}

export function getLevel(issue: SentryIssue) {
    return this.getEvent(issue)?.level;
}

export function getLink(issue: SentryIssue) {
    return issue?.url ?? "https://sentry.io";
}

export function getMessage(issue: SentryIssue) {
    return issue?.message;
}

export function getOrganisation(url: string) {
    const regex = /https:\/\/([\w-]+)\.sentry\.io/;
    const match = url.match(regex);

    return match[1] ?? null;
}

export function getPlatform(issue: SentryIssue) {
    return this.getEvent(issue)?.platform;
}

export function getProject(issue: SentryIssue) {
    return issue?.project?.project_name ?? this.getEvent(issue)?.project?.name;
}

export function getProjectLink(issue: SentryIssue) {
    return `https://${this.getOrganisation(this.getLink(issue))}.sentry.io/projects/${issue.project_slug}`;
}

export function getRelease(issue: SentryIssue) {
    return this.getEvent(issue)?.release;
}

export function getStacktrace(issue: SentryIssue) {
    return (
        this.getEvent(issue)?.stacktrace ??
        this.getEvent(issue)?.exception?.values[0]?.stacktrace
    );
}

export function getTags(issue: SentryIssue) {
    return this.getEvent(issue)?.tags ?? [];
}

export function getTime(issue: SentryIssue) {
    const event = this.getEvent(issue);

    if(event?.timestamp) return new Date(event?.timestamp * 1000);
    if(event?.lastSeen != null) return new Date(event?.lastSeen);

    if(event?.firstSeen != null) return new Date(event?.firstSeen);

    return new Date();
}

export function getTitle(issue: SentryIssue) {
    return this.getEvent(issue)?.title ?? "Sentry Event";
}

export function getType(issue: SentryIssue) {
    return this.getEvent(issue)?.type;
}

export function getUser(issue: SentryIssue) {
    return this.getEvent(issue)?.user;
}
