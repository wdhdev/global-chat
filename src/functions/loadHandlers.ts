import fs from "fs";

import ExtendedClient from "../classes/ExtendedClient";

export default function(client: ExtendedClient, Discord: any) {
    const handlers = fs.readdirSync("./dist/handlers").filter((file: String) => file.endsWith(".js"));

    for(const file of handlers) {
        require(`../../handlers/${file}`)(client, Discord);
    }
}
