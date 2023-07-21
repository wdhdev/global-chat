import Roles from "./Roles";

export default class {
    public name: string;
    public startsWith: boolean;
    public requiredRoles: Roles;
    public execute: Function;
}
