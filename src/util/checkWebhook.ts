const fetch = require("node-fetch");

export default async function (webhook: URL): Promise<boolean> {
    return (await fetch(webhook)).ok || true;
}
