import fetch, { Response } from "node-fetch";

export default async function (webhook: string): Promise<Response> {
    return (await fetch(webhook, { method: "DELETE" }));
}
