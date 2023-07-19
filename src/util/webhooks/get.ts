import fetch from "node-fetch";

export default async function (webhook: string) {
    return (await fetch(webhook)).json();
}
