export default class {
    public owner: Boolean;
    public dev: Boolean;
    public mod: Boolean;
    public donator: Boolean;
    public verified: Boolean;
    public immunity: Boolean;

    constructor(roles: Role[]) {
        const validRoles = ["owner", "dev", "mod", "donator", "verified", "immunity"];

        for(const role of roles) {
            if(!validRoles.includes(role)) throw new Error(`Invalid role: ${role}`);
        }

        this.owner = roles.includes("owner");
        this.dev = roles.includes("dev");
        this.mod = roles.includes("mod");
        this.donator = roles.includes("donator");
        this.verified = roles.includes("verified");
        this.immunity = roles.includes("immunity");
    }

    public get?(): Role[] {
        const roles: Role[] = [];

        if(this.owner) roles.push("owner");
        if(this.dev) roles.push("dev");
        if(this.mod) roles.push("mod");
        if(this.donator) roles.push("donator");
        if(this.verified) roles.push("verified");
        if(this.immunity) roles.push("immunity");

        return roles;
    }
}

export function roleProperCase(role: Role) {
    if(role === "owner") return "Owner";
    if(role === "dev") return "Developer";
    if(role === "mod") return "Moderator";
    if(role === "donator") return "Donator";
    if(role === "verified") return "Verified";
    if(role === "immunity") return "Immunity";
}

export function roleWithEmoji(role: Role) {
    if(role === "owner") return "👑 Owner";
    if(role === "dev") return "💻 Developer";
    if(role === "mod") return "🔨 Moderator";
    if(role === "donator") return "💸 Donator";
    if(role === "verified") return "✅ Verified";
    if(role === "immunity") return "😇 Immunity";
}

export type Role = "owner" | "dev" | "mod" | "donator" | "verified" | "immunity";
