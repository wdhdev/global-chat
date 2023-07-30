export default class Roles {
    public owner: Boolean;
    public dev: Boolean;
    public mod: Boolean;
    public donator: Boolean;
    public verified: Boolean;
    public immunity: Boolean;
}

export type Role = "owner" | "dev" | "mod" | "donator" | "verified" | "immunity";

export function getRoleArray(object: Roles): Role[] {
    const roles: Role[] = [];

    if(object.owner) roles.push("owner");
    if(object.dev) roles.push("dev");
    if(object.mod) roles.push("mod");
    if(object.donator) roles.push("donator");
    if(object.verified) roles.push("verified");
    if(object.immunity) roles.push("immunity");

    return roles;
}

export function getRoleWithEmoji(role: Role): string {
    if(role === "owner") return "👑 Owner";
    if(role === "dev") return "💻 Developer";
    if(role === "mod") return "🔨 Moderator";
    if(role === "donator") return "💸 Donator";
    if(role === "verified") return "✅ Verified";
    if(role === "immunity") return "😇 Immunity";
}
