export default class {
    public owner: Boolean;
    public dev: Boolean;
    public mod: Boolean;
    public donator: Boolean;
    public verified: Boolean;
    public supporter: Boolean;
    public immunity: Boolean;

    constructor(roles: string[]) {
        const validRoles = ["owner", "dev", "mod", "donator", "verified", "supporter", "immunity"];

        for(const role of roles) {
            if(!validRoles.includes(role)) throw new Error(`Invalid role: ${role}`);
        }

        this.owner = roles.includes("owner");
        this.dev = roles.includes("dev");
        this.mod = roles.includes("mod");
        this.donator = roles.includes("donator");
        this.verified = roles.includes("verified");
        this.supporter = roles.includes("supporter");
        this.immunity = roles.includes("immunity");
    }

    public get?(): string[] {
        const roles: string[] = [];

        if(this.owner) roles.push("owner");
        if(this.dev) roles.push("dev");
        if(this.mod) roles.push("mod");
        if(this.donator) roles.push("donator");
        if(this.verified) roles.push("verified");
        if(this.supporter) roles.push("supporter");
        if(this.immunity) roles.push("immunity");

        return roles;
    }
}
