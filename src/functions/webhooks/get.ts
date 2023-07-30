import fetch from "node-fetch";

export default async function (webhook: string): Promise<any> {
    return (await fetch(webhook)).json();
}
