import fs from "fs/promises";

export default async function (path: string) {
    return (await fs.readdir(path, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
}
