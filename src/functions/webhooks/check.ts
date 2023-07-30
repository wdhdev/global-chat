import fetch from "node-fetch";

export default async function (webhook: string): Promise<boolean> {
    return (await fetch(webhook)).ok || true;
}
